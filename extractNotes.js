window.extractNotes = async function extractNotes() {

  console.log("Withing exported function extract Notes");
  // --- Constants for PDF Layout ---
  const PDF_MARGIN = 10; // mm
  const PDF_MAX_WIDTH = 180; // mm (210 - 2 * 10 = 190, so 180 leaves 10mm on each side)
  const PDF_PAGE_HEIGHT = 297; // A4 height in mm
  const PDF_BOTTOM_THRESHOLD = PDF_PAGE_HEIGHT - 17; // Roughly 17mm from bottom for safety
  const LINE_HEIGHT = 6; // mm per line of text
  var content = {};

  // --- Helper to load external scripts dynamically ---
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (window.jspdf) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load script ' + url));
      document.head.appendChild(script);
    });
  }

  // --- HTML to Styled Text Segments Converter ---
  // Returns an array of { text: string, bold: boolean }
  function htmlToStyledTextSegments(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const segments = [];

    // Recursive helper to traverse DOM and extract styled text
    function walk(node, bold = false) {
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.replace(/\s+/g, ' ').trim();
          if (text) segments.push({ text, bold });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName.toLowerCase();
          switch (tag) {
            case 'br':
              segments.push({ text: '\n', bold: false });
              break;
            case 'strong':
            case 'b':
              walk(child, true); // Children are bold
              break;
            case 'div':
            case 'p':
              walk(child, bold);
              segments.push({ text: '\n', bold: false }); // Add newline after block
              break;
            case 'ul':
              child.querySelectorAll('li').forEach(li => {
                segments.push({ text: '• ', bold: false }); // Bullet point
                walk(li, bold);
                segments.push({ text: '\n', bold: false }); // Newline after list item
              });
              break;
            default:
              walk(child, bold); // Continue for other tags
          }
        }
      });
    }

    walk(doc.body);

    // Combine adjacent text segments with the same style
    const combined = [];
    let buffer = '';
    let currentBold = null;

    for (const seg of segments) {
      if (seg.text === '\n') {
        if (buffer) combined.push({ text: buffer.trim(), bold: currentBold });
        combined.push({ text: '\n', bold: false });
        buffer = '';
        currentBold = null;
        continue;
      }

      if (currentBold === null) {
        currentBold = seg.bold;
        buffer = seg.text;
      } else if (seg.bold === currentBold) {
        buffer += ' ' + seg.text;
      } else {
        combined.push({ text: buffer.trim(), bold: currentBold });
        currentBold = seg.bold;
        buffer = seg.text;
      }
    }
    if (buffer) combined.push({ text: buffer.trim(), bold: currentBold });

    return combined;
  }

  // --- Function to add a horizontal divider to the PDF ---
  function addDivider(doc, currentY) {
    // Add space before divider
    currentY += 10;
    // Check for page overflow before drawing divider
    if (currentY > PDF_BOTTOM_THRESHOLD) {
      doc.addPage();
      currentY = PDF_MARGIN * 2; // Start lower on new page
    }
    // Draw divider line
    doc.setDrawColor(150, 150, 150); // Gray
    doc.setLineWidth(0.5); // Thin
    doc.line(PDF_MARGIN, currentY, PDF_PAGE_HEIGHT - PDF_MARGIN * 2.5, currentY); // Line from left to almost right margin
    currentY += 10; // Add space after divider
    return currentY;
  }

  // --- Function to draw a single notebook content section ---
  function drawNotebookContent(doc, notebookContentElement, cursorY) {
    const dateText = notebookContentElement.querySelector('.date')?.innerText.trim() || 'No Date';
    const hiddenHTML = notebookContentElement.querySelector('[data-full-note]')?.innerHTML || '';

    // Clean HTML to check for actual content
    const cleanedHiddenHTML = hiddenHTML
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .trim();

    if (!cleanedHiddenHTML) {
      console.log(`Skipping notebook content with date "${dateText}" as its hidden HTML is blank.`);
      return { cursorY, contentAdded: false }; // Indicate no content was added
    }

    // Check for page overflow before drawing the date
    if (cursorY > PDF_BOTTOM_THRESHOLD) {
      doc.addPage();
      cursorY = PDF_MARGIN * 2; // Start lower on new page
    }

    // Draw Date
    doc.setFont('Helvetica');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(dateText, PDF_MARGIN, cursorY);
    cursorY += 10; // Space after date

    // Prepare content segments
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    const segments = htmlToStyledTextSegments(
      hiddenHTML
      .replace(/&nbsp;/g, ' ')
      .replace(/₹/g, 'Rs.')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    );
console.log(dateText+" "+hiddenHTML);

    // Draw content segments
    segments.forEach(seg => {
      if (seg.text === '\n') {
        cursorY += LINE_HEIGHT;
        return;
      }

      const lines = doc.splitTextToSize(seg.text, PDF_MAX_WIDTH);
      lines.forEach(line => {
        if (cursorY > PDF_BOTTOM_THRESHOLD) { // Check for page overflow during content drawing
          doc.addPage();
          cursorY = PDF_MARGIN * 2; // Reset cursor for new page
          doc.setFont(undefined, 'normal'); // Re-apply normal font on new page
        }
        doc.setFont(undefined, seg.bold ? 'bold' : 'normal');
        doc.text(line, PDF_MARGIN, cursorY);
        cursorY += LINE_HEIGHT;
      });
    });

    return { cursorY, contentAdded: true }; // Return updated cursorY and flag
  }

  // --- Main PDF Export Function ---
  async function exportPDF() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    const { jsPDF } = window.jspdf;

    const notebookContents = document.querySelectorAll('.notebook-content');

    if (notebookContents.length === 0) {
      alert('No notebook content found on this page.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let cursorY = PDF_MARGIN * 2; // Starting Y position (e.g., 20mm from top)
    let contentAddedToDoc = false; // Tracks if any content has been successfully added

    for (const notebookContent of notebookContents) {
      // Add divider before processing subsequent valid content
      if (contentAddedToDoc) {
        cursorY = addDivider(doc, cursorY);
      }

      // Draw the current notebook content
      const { cursorY: updatedCursorY, contentAdded } = drawNotebookContent(doc, notebookContent, cursorY);
      cursorY = updatedCursorY;
      if (contentAdded) {
        contentAddedToDoc = true;
      }
    }

    if (!contentAddedToDoc) {
      alert('No valid notebook content found to export.');
      return;
    }

    doc.save('all-notebook-contents-with-dividers.pdf');
  }

  // Initiate the export process
  exportPDF();
}