interface CertificateElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex: number;
  content?: string;
  imageUrl?: string;
  opacity?: number;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
}

interface CertificateTemplateProps {
  elements?: CertificateElement[];
  onElementMove?: (id: string, x: number, y: number) => void;
  onElementSelect?: (id: string) => void;
}

export default function CertificateTemplate({
  elements = [],
  onElementMove,
  onElementSelect
}: CertificateTemplateProps) {
  const defaultElements: CertificateElement[] = [
    {
      id: 'background-color',
      type: 'backgroundColor',
      x: 0,
      y: 0,
      width: 1056,
      height: 816,
      zIndex: 1,
      backgroundColor: '#ffffff'
    },
    {
      id: 'background-pattern',
      type: 'backgroundPattern',
      x: 0,
      y: 0,
      width: 1056,
      height: 816,
      zIndex: 2,
      imageUrl: '/patterns/pattern.png',
      opacity: 0.1
    },
    {
      id: 'watermark',
      type: 'watermark',
      x: 528,
      y: 408,
      width: 600,
      height: 600,
      zIndex: 3,
      imageUrl: '/watermark.png',
      opacity: 0.05
    },
    {
      id: 'margin',
      type: 'margin',
      x: 40,
      y: 40,
      width: 976,
      height: 736,
      zIndex: 10,
      opacity: 0.1
    },
    {
      id: 'border',
      type: 'border',
      x: 30,
      y: 30,
      width: 996,
      height: 756,
      zIndex: 11,
      imageUrl: '/borders/border.png'
    },
    {
      id: 'frame-elements',
      type: 'frameElements',
      x: 50,
      y: 50,
      width: 956,
      height: 716,
      zIndex: 12,
      imageUrl: '/frames/frame.png'
    },
    {
      id: 'corner-ornament-tl',
      type: 'cornerOrnament',
      x: 60,
      y: 60,
      width: 80,
      height: 80,
      zIndex: 20,
      imageUrl: '/ornaments/corner-tl.png'
    },
    {
      id: 'corner-ornament-tr',
      type: 'cornerOrnament',
      x: 916,
      y: 60,
      width: 80,
      height: 80,
      zIndex: 20,
      imageUrl: '/ornaments/corner-tr.png'
    },
    {
      id: 'corner-ornament-bl',
      type: 'cornerOrnament',
      x: 60,
      y: 676,
      width: 80,
      height: 80,
      zIndex: 20,
      imageUrl: '/ornaments/corner-bl.png'
    },
    {
      id: 'corner-ornament-br',
      type: 'cornerOrnament',
      x: 916,
      y: 676,
      width: 80,
      height: 80,
      zIndex: 20,
      imageUrl: '/ornaments/corner-br.png'
    },
    {
      id: 'decorative-icon-left',
      type: 'decorativeIcon',
      x: 80,
      y: 408,
      width: 60,
      height: 60,
      zIndex: 25,
      imageUrl: '/icons/decorative-left.png'
    },
    {
      id: 'decorative-icon-right',
      type: 'decorativeIcon',
      x: 916,
      y: 408,
      width: 60,
      height: 60,
      zIndex: 25,
      imageUrl: '/icons/decorative-right.png'
    },
    {
      id: 'logo-top-left',
      type: 'logo',
      x: 120,
      y: 80,
      width: 100,
      height: 100,
      zIndex: 30,
      imageUrl: '/logos/logo-1.png'
    },
    {
      id: 'logo-top-center',
      type: 'logo',
      x: 468,
      y: 80,
      width: 120,
      height: 120,
      zIndex: 30,
      imageUrl: '/logos/logo-2.png'
    },
    {
      id: 'logo-top-right',
      type: 'logo',
      x: 836,
      y: 80,
      width: 100,
      height: 100,
      zIndex: 30,
      imageUrl: '/logos/logo-3.png'
    },
    {
      id: 'logo-center-watermark',
      type: 'logo',
      x: 453,
      y: 333,
      width: 150,
      height: 150,
      zIndex: 30,
      imageUrl: '/logos/logo-4.png',
      opacity: 0.1
    },
    {
      id: 'header-section',
      type: 'text',
      x: 528,
      y: 230,
      width: 816,
      zIndex: 41,
      content: 'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES\nCOLLEGE OF ENGINEERING\nSta. Mesa, Manila',
      fontSize: 14,
      textAlign: 'center',
      color: '#333333'
    },
    {
      id: 'introductory-word',
      type: 'text',
      x: 528,
      y: 290,
      width: 100,
      zIndex: 42,
      content: 'This',
      fontSize: 12,
      textAlign: 'center',
      color: '#666666'
    },
    {
      id: 'certificate-title',
      type: 'text',
      x: 528,
      y: 310,
      width: 816,
      zIndex: 43,
      content: 'CERTIFICATE OF COMPLETION',
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#1a1a1a'
    },
    {
      id: 'award-statement',
      type: 'text',
      x: 528,
      y: 360,
      width: 400,
      zIndex: 44,
      content: 'is awarded to',
      fontSize: 14,
      textAlign: 'center',
      color: '#444444'
    },
    {
      id: 'recipient-name',
      type: 'text',
      x: 528,
      y: 390,
      width: 600,
      zIndex: 45,
      content: 'Lyka Mae Sebelina',
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#000000'
    },
    {
      id: 'description-paragraph',
      type: 'text',
      x: 528,
      y: 440,
      width: 696,
      zIndex: 46,
      content: 'for her active participation in the CIVIL SERVICE EXAMINATION REVIEW CLASS, conducted during the First Semester of 2019-2020 Academic Year, which aimed to prepare aspiring civil servants for their professional journey.',
      fontSize: 13,
      textAlign: 'center',
      color: '#444444'
    },
    {
      id: 'date-venue-line',
      type: 'text',
      x: 528,
      y: 520,
      width: 700,
      zIndex: 47,
      content: 'Given this 24th of February 2023 at the Polytechnic University of the Philippines.',
      fontSize: 12,
      textAlign: 'center',
      color: '#555555'
    },
    {
      id: 'signature-left',
      type: 'signature',
      x: 300,
      y: 616,
      width: 200,
      zIndex: 50,
      content: '_____________________\nDr. John Doe\nCollege Dean'
    },
    {
      id: 'signature-right',
      type: 'signature',
      x: 756,
      y: 616,
      width: 200,
      zIndex: 50,
      content: '_____________________\nProf. Jane Smith\nProgram Director'
    },
    {
      id: 'qr-code',
      type: 'qrCode',
      x: 936,
      y: 696,
      width: 80,
      height: 80,
      zIndex: 60,
      imageUrl: '/qr-code.png'
    }
  ];

  const displayElements = elements.length > 0 ? elements : defaultElements;

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', elementId);
  };

  const handleDrag = (e: React.DragEvent, element: CertificateElement) => {
    if (e.clientX === 0 && e.clientY === 0) return;

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (onElementMove && x > 0 && y > 0) {
      onElementMove(element.id, x, y);
    }
  };

  const renderElement = (element: CertificateElement) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.type === 'text' || element.type === 'signature'
        ? `${element.x}px`
        : `${element.x}px`,
      top: `${element.y}px`,
      width: element.width ? `${element.width}px` : 'auto',
      height: element.height ? `${element.height}px` : 'auto',
      zIndex: element.zIndex,
      opacity: element.opacity ?? 1,
      cursor: 'move',
      userSelect: 'none'
    };

    if (element.type === 'text' || element.type === 'signature') {
      baseStyle.transform = 'translateX(-50%)';
    }

    switch (element.type) {
      case 'backgroundColor':
        return (
          <div
            key={element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, element.id)}
            onDrag={(e) => handleDrag(e, element)}
            onClick={() => onElementSelect?.(element.id)}
            style={{
              ...baseStyle,
              backgroundColor: element.backgroundColor,
              cursor: 'default'
            }}
          />
        );

      case 'backgroundPattern':
      case 'watermark':
      case 'border':
      case 'frameElements':
      case 'cornerOrnament':
      case 'decorativeIcon':
      case 'logo':
      case 'qrCode':
        return (
          <div
            key={element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, element.id)}
            onDrag={(e) => handleDrag(e, element)}
            onClick={() => onElementSelect?.(element.id)}
            style={baseStyle}
          >
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt={element.type}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  border: '2px dashed #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#999'
                }}
              >
                {element.type}
              </div>
            )}
          </div>
        );

      case 'margin':
        return (
          <div
            key={element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, element.id)}
            onDrag={(e) => handleDrag(e, element)}
            onClick={() => onElementSelect?.(element.id)}
            style={{
              ...baseStyle,
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          />
        );

      case 'text':
      case 'signature':
        return (
          <div
            key={element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, element.id)}
            onDrag={(e) => handleDrag(e, element)}
            onClick={() => onElementSelect?.(element.id)}
            style={{
              ...baseStyle,
              fontSize: element.fontSize ? `${element.fontSize}px` : '14px',
              fontWeight: element.fontWeight ?? 'normal',
              textAlign: (element.textAlign as any) ?? 'center',
              color: element.color ?? '#000000',
              whiteSpace: 'pre-line',
              lineHeight: element.type === 'signature' ? '1.4' : '1.6'
            }}
          >
            {element.content}
            {element.id === 'recipient-name' && (
              <div
                style={{
                  borderBottom: '2px solid rgba(0,0,0,0.3)',
                  width: '100%',
                  marginTop: '4px'
                }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div
        className="relative bg-white shadow-2xl"
        style={{
          width: '1056px',
          height: '816px',
          overflow: 'hidden'
        }}
      >
        {displayElements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => renderElement(element))}
      </div>
    </div>
  );
}
