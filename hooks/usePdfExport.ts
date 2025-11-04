import { useState } from 'react';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const exportPageAsPdf = async () => {
    const stylesheetStates: Array<{ sheet: HTMLStyleElement | HTMLLinkElement; disabled: boolean }> = [];
    
    try {
      const element = document.querySelector('[role="main"]') as HTMLElement;
      if (!element) {
        throw new Error("Không tìm thấy nội dung để xuất. Vui lòng làm mới trang và thử lại.");
      }
      
      const allElements = element.querySelectorAll('*') as NodeListOf<HTMLElement>;
      const elementStyles = new Map<HTMLElement, string>();
      
      allElements.forEach((el) => {
        try {
          const computed = window.getComputedStyle(el);
          const inlineStyles: string[] = [];
          
          if (computed.color && computed.color.startsWith('rgb')) {
            inlineStyles.push(`color: ${computed.color}`);
          }
          if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor.startsWith('rgb')) {
            inlineStyles.push(`background-color: ${computed.backgroundColor}`);
          }
          if (computed.borderColor && computed.borderColor.startsWith('rgb')) {
            inlineStyles.push(`border-color: ${computed.borderColor}`);
          }
          if (computed.outlineColor && computed.outlineColor.startsWith('rgb')) {
            inlineStyles.push(`outline-color: ${computed.outlineColor}`);
          }
          
          if (computed.display) inlineStyles.push(`display: ${computed.display}`);
          if (computed.position) inlineStyles.push(`position: ${computed.position}`);
          if (computed.width && computed.width !== 'auto' && computed.width !== '0px') {
            inlineStyles.push(`width: ${computed.width}`);
          }
          if (computed.height && computed.height !== 'auto' && computed.height !== '0px') {
            inlineStyles.push(`height: ${computed.height}`);
          }
          if (computed.padding) inlineStyles.push(`padding: ${computed.padding}`);
          if (computed.margin) inlineStyles.push(`margin: ${computed.margin}`);
          if (computed.borderRadius) inlineStyles.push(`border-radius: ${computed.borderRadius}`);
          if (computed.borderWidth) inlineStyles.push(`border-width: ${computed.borderWidth}`);
          if (computed.borderStyle) inlineStyles.push(`border-style: ${computed.borderStyle}`);
          if (computed.boxSizing) inlineStyles.push(`box-sizing: ${computed.boxSizing}`);
          if (computed.overflow) inlineStyles.push(`overflow: ${computed.overflow}`);
          if (computed.overflowX) inlineStyles.push(`overflow-x: ${computed.overflowX}`);
          if (computed.overflowY) inlineStyles.push(`overflow-y: ${computed.overflowY}`);
          
          if (computed.fontSize) inlineStyles.push(`font-size: ${computed.fontSize}`);
          if (computed.fontWeight) inlineStyles.push(`font-weight: ${computed.fontWeight}`);
          if (computed.fontFamily) inlineStyles.push(`font-family: ${computed.fontFamily}`);
          if (computed.textAlign) inlineStyles.push(`text-align: ${computed.textAlign}`);
          if (computed.lineHeight) inlineStyles.push(`line-height: ${computed.lineHeight}`);
          if (computed.textDecoration) inlineStyles.push(`text-decoration: ${computed.textDecoration}`);
          if (computed.textTransform) inlineStyles.push(`text-transform: ${computed.textTransform}`);
          if (computed.letterSpacing) inlineStyles.push(`letter-spacing: ${computed.letterSpacing}`);
          if (computed.whiteSpace) inlineStyles.push(`white-space: ${computed.whiteSpace}`);
          
          if (computed.flexDirection) inlineStyles.push(`flex-direction: ${computed.flexDirection}`);
          if (computed.justifyContent) inlineStyles.push(`justify-content: ${computed.justifyContent}`);
          if (computed.alignItems) inlineStyles.push(`align-items: ${computed.alignItems}`);
          if (computed.alignContent) inlineStyles.push(`align-content: ${computed.alignContent}`);
          if (computed.flexWrap) inlineStyles.push(`flex-wrap: ${computed.flexWrap}`);
          if (computed.gap) inlineStyles.push(`gap: ${computed.gap}`);
          if (computed.gridTemplateColumns) inlineStyles.push(`grid-template-columns: ${computed.gridTemplateColumns}`);
          if (computed.gridTemplateRows) inlineStyles.push(`grid-template-rows: ${computed.gridTemplateRows}`);
          if (computed.gridColumn) inlineStyles.push(`grid-column: ${computed.gridColumn}`);
          if (computed.gridRow) inlineStyles.push(`grid-row: ${computed.gridRow}`);
          
          if (computed.boxShadow && computed.boxShadow !== 'none') {
            inlineStyles.push(`box-shadow: ${computed.boxShadow}`);
          }
          if (computed.opacity && computed.opacity !== '1') {
            inlineStyles.push(`opacity: ${computed.opacity}`);
          }
          if (computed.transform && computed.transform !== 'none') {
            inlineStyles.push(`transform: ${computed.transform}`);
          }
          if (computed.zIndex && computed.zIndex !== 'auto') {
            inlineStyles.push(`z-index: ${computed.zIndex}`);
          }
          
          if (inlineStyles.length > 0) {
            elementStyles.set(el, inlineStyles.join('; '));
          }
        } catch (e) {
        }
      });
      
      try {
        const computed = window.getComputedStyle(element);
        const inlineStyles: string[] = [];
        if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor.startsWith('rgb')) {
          inlineStyles.push(`background-color: ${computed.backgroundColor}`);
        }
        if (computed.padding) inlineStyles.push(`padding: ${computed.padding}`);
        if (computed.margin) inlineStyles.push(`margin: ${computed.margin}`);
        if (inlineStyles.length > 0) {
          elementStyles.set(element, inlineStyles.join('; '));
        }
      } catch (e) {
      }
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '0';
      iframe.style.top = '0';
      iframe.style.width = (element.scrollWidth + 200) + 'px';
      iframe.style.height = (element.scrollHeight + 200) + 'px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-1';
      iframe.style.overflow = 'visible';
      document.body.appendChild(iframe);
      
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error("Không thể tạo iframe để xuất PDF.");
        }
        
        const clonedElement = element.cloneNode(true) as HTMLElement;
        const clonedElements = clonedElement.querySelectorAll('*') as NodeListOf<HTMLElement>;
        const originalElementsArray = Array.from(allElements);
        
        clonedElements.forEach((clonedEl, index) => {
          if (index < originalElementsArray.length) {
            const originalEl = originalElementsArray[index];
            const styles = elementStyles.get(originalEl);
            if (styles) {
              clonedEl.setAttribute('style', styles);
            }
          }
        });
        
        const rootStyles = elementStyles.get(element);
        if (rootStyles) {
          clonedElement.setAttribute('style', rootStyles);
        }
        
        const clonedWidth = element.scrollWidth || element.offsetWidth || 1200;
        const padding = 40;
        
        clonedElement.style.width = `${clonedWidth}px`;
        clonedElement.style.minWidth = `${clonedWidth}px`;
        clonedElement.style.maxWidth = `${clonedWidth}px`;
        clonedElement.style.margin = '0';
        clonedElement.style.padding = '0';
        
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Báo cáo thống kê</title>
              <style>
                * {
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                html {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: auto;
                  overflow: visible !important;
                }
                body {
                  margin: 0;
                  padding: ${padding}px;
                  width: auto;
                  min-width: ${clonedWidth + (padding * 2)}px;
                  height: auto;
                  background: white;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  overflow: visible !important;
                  overflow-x: visible !important;
                  overflow-y: visible !important;
                }
                div, section, article, main {
                  overflow: visible !important;
                }
                svg {
                  overflow: visible !important;
                }
                .recharts-wrapper, .recharts-surface {
                  overflow: visible !important;
                }
                table {
                  border-collapse: separate;
                  border-spacing: 0;
                  width: 100%;
                  table-layout: auto;
                }
                td, th {
                  overflow: visible !important;
                  white-space: normal;
                  word-wrap: break-word;
                }
                [class*="card"], [class*="Card"] {
                  overflow: visible !important;
                  margin: 0 !important;
                }
              </style>
            </head>
            <body>
              ${clonedElement.outerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();
        
        await new Promise((resolve) => {
          if (iframeDoc.readyState === 'complete') {
            setTimeout(resolve, 1000);
          } else {
            iframeDoc.addEventListener('load', () => setTimeout(resolve, 1000));
          }
        });
        
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const iframeBody = iframeDoc.body;
        if (!iframeBody) {
          throw new Error("Không thể truy cập nội dung iframe.");
        }
        
        iframeBody.offsetHeight;
        iframeBody.offsetWidth;
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const contentWidth = Math.max(
          iframeBody.scrollWidth,
          iframeBody.offsetWidth,
          clonedWidth + (padding * 2)
        );
        const contentHeight = Math.max(
          iframeBody.scrollHeight,
          iframeBody.offsetHeight
        ) + (padding * 2);
        
        iframeBody.style.width = `${contentWidth}px`;
        iframeBody.style.minWidth = `${contentWidth}px`;
        iframeBody.style.height = 'auto';
        iframeBody.style.minHeight = `${contentHeight}px`;
        
        const html2pdf = (await import('html2pdf.js')).default;
        
        const a3LandscapeUsableWidth = 1512;
        
        const baseScale = Math.min(4, Math.max(2, a3LandscapeUsableWidth / contentWidth));
        
        const opt = {
          margin: [15, 15, 15, 15] as [number, number, number, number],
          filename: `stats_export_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { 
            scale: baseScale,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            letterRendering: true,
            removeContainer: true,
            ignoreElements: (element: Element) => {
              return element.classList.contains('scrollbar') || 
                     element.getAttribute('data-scrollbar') === 'true';
            },
            onclone: (clonedDoc: Document, element: HTMLElement) => {
              const clonedBody = clonedDoc.body;
              if (clonedBody) {
                clonedBody.style.transform = 'translateZ(0)';
                clonedBody.style.willChange = 'transform';
                
                clonedBody.style.overflow = 'visible';
                clonedBody.style.overflowX = 'visible';
                clonedBody.style.overflowY = 'visible';
              }
              
              const allClonedElements = clonedDoc.querySelectorAll('*') as NodeListOf<HTMLElement>;
              allClonedElements.forEach((el) => {
                const iframeWindow = clonedDoc.defaultView || (clonedDoc as any).parentWindow;
                if (!iframeWindow) return;
                
                const computed = iframeWindow.getComputedStyle(el);
                
                if (computed.display === 'none') {
                  el.style.display = 'none';
                }
                if (computed.position === 'absolute' || computed.position === 'fixed') {
                  el.style.position = computed.position;
                }
                
                if (computed.display === 'flex' || computed.display === 'grid') {
                  el.style.display = computed.display;
                }
                
                if (computed.overflow === 'hidden' || computed.overflow === 'clip') {
                  el.style.overflow = 'visible';
                }
                if (computed.overflowX === 'hidden' || computed.overflowX === 'clip') {
                  el.style.overflowX = 'visible';
                }
                if (computed.overflowY === 'hidden' || computed.overflowY === 'clip') {
                  el.style.overflowY = 'visible';
                }
                
                if (el.tagName === 'svg' || el.classList.contains('recharts-wrapper') || el.classList.contains('recharts-surface')) {
                  el.style.overflow = 'visible';
                  const parent = el.parentElement;
                  if (parent) {
                    parent.style.overflow = 'visible';
                  }
                }
                
                if (el.tagName === 'TD' || el.tagName === 'TH') {
                  el.style.overflow = 'visible';
                  el.style.textOverflow = 'clip';
                }
              });
              
              const images = clonedDoc.querySelectorAll('img');
              images.forEach((img: HTMLImageElement) => {
                if (!img.complete) {
                  img.style.display = 'none';
                }
              });
              
              const svgs = clonedDoc.querySelectorAll('svg');
              svgs.forEach((svg: SVGElement) => {
                svg.style.overflow = 'visible';
                const parent = svg.parentElement;
                if (parent) {
                  parent.style.overflow = 'visible';
                }
              });
              
              return new Promise((resolve) => {
                setTimeout(() => {
                  clonedBody.offsetHeight;
                  clonedBody.offsetWidth;
                  allClonedElements.forEach((el) => {
                    el.offsetHeight;
                  });
                  resolve(undefined);
                }, 200);
              });
            },
            windowWidth: contentWidth,
            windowHeight: contentHeight,
            scrollX: 0, 
            scrollY: 0,
            x: 0,
            y: 0,
            width: contentWidth,
            height: contentHeight,
            foreignObjectRendering: true,
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a3', 
            orientation: 'landscape',
            compress: false,
            precision: 16
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).forEach((sheet: any) => {
          stylesheetStates.push({ sheet, disabled: sheet.disabled || false });
          sheet.disabled = true;
        });
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
        const captureElement = iframeDoc.documentElement || iframeBody;
        
        if (iframeDoc.documentElement) {
          iframeDoc.documentElement.style.width = `${contentWidth}px`;
          iframeDoc.documentElement.style.height = 'auto';
          iframeDoc.documentElement.style.overflow = 'visible';
        }
        
        // @ts-ignore
        await html2pdf().set(opt).from(captureElement).save();
        } finally {
          stylesheetStates.forEach(({ sheet, disabled }: { sheet: HTMLStyleElement | HTMLLinkElement; disabled: boolean }) => {
            sheet.disabled = disabled;
          });
        }
        
      } finally {
        setTimeout(() => {
          try {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (e) {
          }
        }, 1000);
      }
      
    } catch (err) {
      try {
        stylesheetStates.forEach(({ sheet, disabled }: { sheet: HTMLStyleElement | HTMLLinkElement; disabled: boolean }) => {
          sheet.disabled = disabled;
        });
      } catch (restoreError) {
      }
      
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi xuất PDF.";
      throw new Error(errorMessage);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportPageAsPdf();
      setIsExportModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Không thể xuất báo cáo. Vui lòng thử lại.";
      alert(`Lỗi xuất PDF: ${errorMessage}`);
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    isExportModalOpen,
    setIsExportModalOpen,
    handleExport,
  };
}

