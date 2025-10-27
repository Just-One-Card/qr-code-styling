import dotTypes from "../../constants/dotTypes";
import { DotType, GetNeighbor, DrawArgs, BasicFigureDrawArgs, RotateFigureArgs, Window } from "../../types";

type LineDecision = {
  direction: 'horizontal' | 'vertical' | 'single';
  position: 'start' | 'middle' | 'end';
};

export default class QRDot {
  _element?: SVGElement;
  _svg: SVGElement;
  _type: DotType;
  _window: Window;
  _morseLineDecisions: Map<string, LineDecision>;
  _dotScale: number;

  constructor({ svg, type, window, dotScale = 1.0 }: { svg: SVGElement; type: DotType; window: Window; dotScale?: number }) {
    this._svg = svg;
    this._type = type;
    this._window = window;
    this._morseLineDecisions = new Map<string, LineDecision>();
    this._dotScale = Math.max(0.1, Math.min(1.0, dotScale)); // Ogranicz do 0.1 - 1.0
  }

  draw(x: number, y: number, size: number, getNeighbor: GetNeighbor, row?: number, col?: number): void {
    const type = this._type;
    let drawFunction;

    switch (type) {
      case dotTypes.dots:
        drawFunction = this._drawDot;
        break;
      case dotTypes.classy:
        drawFunction = this._drawClassy;
        break;
      case dotTypes.classyRounded:
        drawFunction = this._drawClassyRounded;
        break;
      case dotTypes.rounded:
        drawFunction = this._drawRounded;
        break;
      case dotTypes.extraRounded:
        drawFunction = this._drawExtraRounded;
        break;
      case dotTypes.morse:
        drawFunction = this._drawMorse;
        break;
      case dotTypes.square:
      default:
        drawFunction = this._drawSquare;
    }

    drawFunction.call(this, { x, y, size, getNeighbor, row, col });
  }

  _rotateFigure({ x, y, size, rotation = 0, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    draw();
    this._element?.setAttribute("transform", `rotate(${(180 * rotation) / Math.PI},${cx},${cy})`);
  }

  // Pomocnicza metoda do obliczania przeskalowanych wymiarów i wyśrodkowanej pozycji
  _getScaledDimensions(x: number, y: number, size: number): { x: number; y: number; size: number } {
    const scaledSize = size * this._dotScale;
    const offset = (size - scaledSize) / 2;
    return {
      x: x + offset,
      y: y + offset,
      size: scaledSize
    };
  }

  _basicDot(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaled = this._getScaledDimensions(x, y, size);

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this._element.setAttribute("cx", String(scaled.x + scaled.size / 2));
        this._element.setAttribute("cy", String(scaled.y + scaled.size / 2));
        this._element.setAttribute("r", String(scaled.size / 2));
      }
    });
  }

  _basicSquare(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaled = this._getScaledDimensions(x, y, size);

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(scaled.x));
        this._element.setAttribute("y", String(scaled.y));
        this._element.setAttribute("width", String(scaled.size));
        this._element.setAttribute("height", String(scaled.size));
      }
    });
  }

  // Prostokąt dla środkowych elementów linii poziomej morse
  // Pełna szerokość, przeskalowana wysokość
  _basicRectHorizontalLine(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaledSize = size * this._dotScale;
    const offset = (size - scaledSize) / 2;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x));
        this._element.setAttribute("y", String(y + offset));
        this._element.setAttribute("width", String(size));
        this._element.setAttribute("height", String(scaledSize));
      }
    });
  }

  // Prostokąt dla środkowych elementów linii pionowej morse
  // Pełna wysokość, przeskalowana szerokość
  _basicRectVerticalLine(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaledSize = size * this._dotScale;
    const offset = (size - scaledSize) / 2;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._element.setAttribute("x", String(x + offset));
        this._element.setAttribute("y", String(y));
        this._element.setAttribute("width", String(scaledSize));
        this._element.setAttribute("height", String(size));
      }
    });
  }

  //if rotation === 0 - right side is rounded
  _basicSideRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaled = this._getScaledDimensions(x, y, size);

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${scaled.x} ${scaled.y}` +
            `v ${scaled.size}` +
            `h ${scaled.size / 2}` +
            `a ${scaled.size / 2} ${scaled.size / 2}, 0, 0, 0, 0 ${-scaled.size}`
        );
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  _basicCornerRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaled = this._getScaledDimensions(x, y, size);

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${scaled.x} ${scaled.y}` +
            `v ${scaled.size}` +
            `h ${scaled.size}` +
            `v ${-scaled.size / 2}` +
            `a ${scaled.size / 2} ${scaled.size / 2}, 0, 0, 0, ${-scaled.size / 2} ${-scaled.size / 2}`
        );
      }
    });
  }

  //if rotation === 0 - top right corner is rounded
  _basicCornerExtraRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaled = this._getScaledDimensions(x, y, size);

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${scaled.x} ${scaled.y}` +
            `v ${scaled.size}` +
            `h ${scaled.size}` +
            `a ${scaled.size} ${scaled.size}, 0, 0, 0, ${-scaled.size} ${-scaled.size}`
        );
      }
    });
  }

  //if rotation === 0 - left bottom and right top corners are rounded
  _basicCornersRounded(args: BasicFigureDrawArgs): void {
    const { size, x, y } = args;
    const scaled = this._getScaledDimensions(x, y, size);

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path");
        this._element.setAttribute(
          "d",
          `M ${scaled.x} ${scaled.y}` +
            `v ${scaled.size / 2}` +
            `a ${scaled.size / 2} ${scaled.size / 2}, 0, 0, 0, ${scaled.size / 2} ${scaled.size / 2}` +
            `h ${scaled.size / 2}` +
            `v ${-scaled.size / 2}` +
            `a ${scaled.size / 2} ${scaled.size / 2}, 0, 0, 0, ${-scaled.size / 2} ${-scaled.size / 2}`
        );
      }
    });
  }

  // Draw rect with selective corner rounding
  _basicRoundedRect(args: BasicFigureDrawArgs & {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
  }): void {
    const { size, x, y, topLeft = 0, topRight = 0, bottomLeft = 0, bottomRight = 0 } = args;
    const scaled = this._getScaledDimensions(x, y, size);

    // Promienie są już obliczone na podstawie nieprzeskalowanego rozmiaru,
    // więc musimy je przeskalować proporcjonalnie
    const scale = this._dotScale;
    const scaledTopLeft = topLeft * scale;
    const scaledTopRight = topRight * scale;
    const scaledBottomLeft = bottomLeft * scale;
    const scaledBottomRight = bottomRight * scale;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path");

        let d = `M ${scaled.x + scaledTopLeft} ${scaled.y}`;

        // Top edge
        d += ` h ${scaled.size - scaledTopLeft - scaledTopRight}`;

        // Top right corner
        if (scaledTopRight > 0) {
          d += ` a ${scaledTopRight} ${scaledTopRight}, 0, 0, 1, ${scaledTopRight} ${scaledTopRight}`;
        }

        // Right edge
        d += ` v ${scaled.size - scaledTopRight - scaledBottomRight}`;

        // Bottom right corner
        if (scaledBottomRight > 0) {
          d += ` a ${scaledBottomRight} ${scaledBottomRight}, 0, 0, 1, ${-scaledBottomRight} ${scaledBottomRight}`;
        }

        // Bottom edge
        d += ` h ${-(scaled.size - scaledBottomLeft - scaledBottomRight)}`;

        // Bottom left corner
        if (scaledBottomLeft > 0) {
          d += ` a ${scaledBottomLeft} ${scaledBottomLeft}, 0, 0, 1, ${-scaledBottomLeft} ${-scaledBottomLeft}`;
        }

        // Left edge
        d += ` v ${-(scaled.size - scaledTopLeft - scaledBottomLeft)}`;

        // Top left corner
        if (scaledTopLeft > 0) {
          d += ` a ${scaledTopLeft} ${scaledTopLeft}, 0, 0, 1, ${scaledTopLeft} ${-scaledTopLeft}`;
        }

        d += ` z`;

        this._element.setAttribute("d", d);
      }
    });
  }

  // Zaokrąglony prostokąt dla elementów granicznych linii poziomej morse
  // Rozciąga się do pełnej szerokości w odpowiednią stronę
  _basicRoundedRectMorseHorizontal(args: BasicFigureDrawArgs & {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
    extendRight?: boolean;
  }): void {
    const { size, x, y, topLeft = 0, topRight = 0, bottomLeft = 0, bottomRight = 0, extendRight = false } = args;

    const scaledSize = size * this._dotScale;
    const offset = (size - scaledSize) / 2;

    const scale = this._dotScale;
    const scaledTopLeft = topLeft * scale;
    const scaledTopRight = topRight * scale;
    const scaledBottomLeft = bottomLeft * scale;
    const scaledBottomRight = bottomRight * scale;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path");

        const startX = extendRight ? x + offset : x;
        const startY = y + offset;
        const width = extendRight ? size - offset : size - offset;

        let d = `M ${startX + scaledTopLeft} ${startY}`;

        // Top edge
        d += ` h ${width - scaledTopLeft - scaledTopRight}`;

        // Top right corner
        if (scaledTopRight > 0) {
          d += ` a ${scaledTopRight} ${scaledTopRight}, 0, 0, 1, ${scaledTopRight} ${scaledTopRight}`;
        }

        // Right edge
        d += ` v ${scaledSize - scaledTopRight - scaledBottomRight}`;

        // Bottom right corner
        if (scaledBottomRight > 0) {
          d += ` a ${scaledBottomRight} ${scaledBottomRight}, 0, 0, 1, ${-scaledBottomRight} ${scaledBottomRight}`;
        }

        // Bottom edge
        d += ` h ${-(width - scaledBottomLeft - scaledBottomRight)}`;

        // Bottom left corner
        if (scaledBottomLeft > 0) {
          d += ` a ${scaledBottomLeft} ${scaledBottomLeft}, 0, 0, 1, ${-scaledBottomLeft} ${-scaledBottomLeft}`;
        }

        // Left edge
        d += ` v ${-(scaledSize - scaledTopLeft - scaledBottomLeft)}`;

        // Top left corner
        if (scaledTopLeft > 0) {
          d += ` a ${scaledTopLeft} ${scaledTopLeft}, 0, 0, 1, ${scaledTopLeft} ${-scaledTopLeft}`;
        }

        d += ` z`;

        this._element.setAttribute("d", d);
      }
    });
  }

  // Zaokrąglony prostokąt dla elementów granicznych linii pionowej morse
  // Rozciąga się do pełnej wysokości w odpowiednią stronę
  _basicRoundedRectMorseVertical(args: BasicFigureDrawArgs & {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
    extendDown?: boolean;
  }): void {
    const { size, x, y, topLeft = 0, topRight = 0, bottomLeft = 0, bottomRight = 0, extendDown = false } = args;

    const scaledSize = size * this._dotScale;
    const offset = (size - scaledSize) / 2;

    const scale = this._dotScale;
    const scaledTopLeft = topLeft * scale;
    const scaledTopRight = topRight * scale;
    const scaledBottomLeft = bottomLeft * scale;
    const scaledBottomRight = bottomRight * scale;

    this._rotateFigure({
      ...args,
      draw: () => {
        this._element = this._window.document.createElementNS("http://www.w3.org/2000/svg", "path");

        const startX = x + offset;
        const startY = extendDown ? y + offset : y;
        const height = extendDown ? size - offset : size - offset;

        let d = `M ${startX + scaledTopLeft} ${startY}`;

        // Top edge
        d += ` h ${scaledSize - scaledTopLeft - scaledTopRight}`;

        // Top right corner
        if (scaledTopRight > 0) {
          d += ` a ${scaledTopRight} ${scaledTopRight}, 0, 0, 1, ${scaledTopRight} ${scaledTopRight}`;
        }

        // Right edge
        d += ` v ${height - scaledTopRight - scaledBottomRight}`;

        // Bottom right corner
        if (scaledBottomRight > 0) {
          d += ` a ${scaledBottomRight} ${scaledBottomRight}, 0, 0, 1, ${-scaledBottomRight} ${scaledBottomRight}`;
        }

        // Bottom edge
        d += ` h ${-(scaledSize - scaledBottomLeft - scaledBottomRight)}`;

        // Bottom left corner
        if (scaledBottomLeft > 0) {
          d += ` a ${scaledBottomLeft} ${scaledBottomLeft}, 0, 0, 1, ${-scaledBottomLeft} ${-scaledBottomLeft}`;
        }

        // Left edge
        d += ` v ${-(height - scaledTopLeft - scaledBottomLeft)}`;

        // Top left corner
        if (scaledTopLeft > 0) {
          d += ` a ${scaledTopLeft} ${scaledTopLeft}, 0, 0, 1, ${scaledTopLeft} ${-scaledTopLeft}`;
        }

        d += ` z`;

        this._element.setAttribute("d", d);
      }
    });
  }

  _drawDot({ x, y, size }: DrawArgs): void {
    this._basicDot({ x, y, size, rotation: 0 });
  }

  _drawSquare({ x, y, size }: DrawArgs): void {
    this._basicSquare({ x, y, size, rotation: 0 });
  }

  _drawRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
      this._basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount === 2) {
      let rotation = 0;

      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicCornerRounded({ x, y, size, rotation });
      return;
    }

    if (neighborsCount === 1) {
      let rotation = 0;

      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  _drawExtraRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicDot({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
      this._basicSquare({ x, y, size, rotation: 0 });
      return;
    }

    if (neighborsCount === 2) {
      let rotation = 0;

      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicCornerExtraRounded({ x, y, size, rotation });
      return;
    }

    if (neighborsCount === 1) {
      let rotation = 0;

      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }

      this._basicSideRounded({ x, y, size, rotation });
      return;
    }
  }

  _drawClassy({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    if (!leftNeighbor && !topNeighbor) {
      this._basicCornerRounded({ x, y, size, rotation: -Math.PI / 2 });
      return;
    }

    if (!rightNeighbor && !bottomNeighbor) {
      this._basicCornerRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    this._basicSquare({ x, y, size, rotation: 0 });
  }

  _drawClassyRounded({ x, y, size, getNeighbor }: DrawArgs): void {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;

    if (neighborsCount === 0) {
      this._basicCornersRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    if (!leftNeighbor && !topNeighbor) {
      this._basicCornerExtraRounded({ x, y, size, rotation: -Math.PI / 2 });
      return;
    }

    if (!rightNeighbor && !bottomNeighbor) {
      this._basicCornerExtraRounded({ x, y, size, rotation: Math.PI / 2 });
      return;
    }

    this._basicSquare({ x, y, size, rotation: 0 });
  }

  _drawMorse({ x, y, size, getNeighbor, row, col }: DrawArgs): void {
    if (!getNeighbor || row === undefined || col === undefined) {
      this._basicDot({ x, y, size, rotation: 0 });
      return;
    }

    // Użyj row,col jako klucza
    const key = `${row},${col}`;

    // ZAWSZE najpierw sprawdź mapę
    const existingDecision = this._morseLineDecisions.get(key);
    if (existingDecision) {
      // Punkt już ma decyzję - zastosuj ją i zakończ
      this._applyMorseDecision(existingDecision, x, y, size);
      return;
    }

    // Punkt nie ma decyzji - sprawdź TYLKO prawo i dół
    // (lewo i góra już zostały przetworzone)
    const hasRight = getNeighbor(1, 0);
    const hasBottom = getNeighbor(0, 1);

    // Przypadek 1: Może iść zarówno w prawo jak i w dół - losuj kierunek i oznacz całą linię
    if (hasRight && hasBottom) {
      const useHorizontal = Math.random() < 0.5;
      if (useHorizontal) {
        this._morseMarkLineFromPoint(row, col, 'horizontal', getNeighbor);
      } else {
        this._morseMarkLineFromPoint(row, col, 'vertical', getNeighbor);
      }
      const decision = this._morseLineDecisions.get(key)!;
      this._applyMorseDecision(decision, x, y, size);
      return;
    }

    // Przypadek 2: Może iść tylko w prawo - oznacz linię poziomą
    if (hasRight) {
      this._morseMarkLineFromPoint(row, col, 'horizontal', getNeighbor);
      const decision = this._morseLineDecisions.get(key)!;
      this._applyMorseDecision(decision, x, y, size);
      return;
    }

    // Przypadek 3: Może iść tylko w dół - oznacz linię pionową
    if (hasBottom) {
      this._morseMarkLineFromPoint(row, col, 'vertical', getNeighbor);
      const decision = this._morseLineDecisions.get(key)!;
      this._applyMorseDecision(decision, x, y, size);
      return;
    }

    // Przypadek 4: Nie może iść ani w prawo ani w dół - pojedyncza kropka
    const decision: LineDecision = { direction: 'single', position: 'start' };
    this._morseLineDecisions.set(key, decision);
    this._applyMorseDecision(decision, x, y, size);
  }

  // Oznacza wszystkie punkty w linii (w prawo lub w dół)
  // Zatrzymuje się gdy napotka punkt który już ma decyzję (np. początek prostopadłej linii)
  private _morseMarkLineFromPoint(
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical',
    getNeighbor: GetNeighbor
  ): void {
    // Najpierw policz CAŁKOWITĄ długość linii (łącznie z punktami które już są w mapie)
    // To pozwoli nam określić czy punkt startowy powinien być kropką czy początkiem linii
    let totalLineLength = 1; // zaczynamy od punktu startowego
    let offset = 1;

    if (direction === 'horizontal') {
      while (getNeighbor(offset, 0)) {
        const nextKey = `${startRow},${startCol + offset}`;
        if (this._morseLineDecisions.has(nextKey)) {
          // Punkt już ma decyzję - zatrzymaj liczenie
          break;
        }
        totalLineLength++;
        offset++;
      }
    } else {
      while (getNeighbor(0, offset)) {
        const nextKey = `${startRow + offset},${startCol}`;
        if (this._morseLineDecisions.has(nextKey)) {
          // Punkt już ma decyzję - zatrzymaj liczenie
          break;
        }
        totalLineLength++;
        offset++;
      }
    }

    // Jeśli całkowita długość to 1, oznacz jako pojedynczą kropkę
    if (totalLineLength === 1) {
      const key = `${startRow},${startCol}`;
      this._morseLineDecisions.set(key, {
        direction: 'single',
        position: 'start'
      });
      return;
    }

    // Teraz zbierz punkty które MOŻEMY oznaczyć (bez tych które już są w mapie)
    const points: Array<{ row: number; col: number }> = [];
    points.push({ row: startRow, col: startCol });

    offset = 1;
    if (direction === 'horizontal') {
      while (getNeighbor(offset, 0)) {
        const nextKey = `${startRow},${startCol + offset}`;
        if (this._morseLineDecisions.has(nextKey)) {
          break;
        }
        points.push({ row: startRow, col: startCol + offset });
        offset++;
      }
    } else {
      while (getNeighbor(0, offset)) {
        const nextKey = `${startRow + offset},${startCol}`;
        if (this._morseLineDecisions.has(nextKey)) {
          break;
        }
        points.push({ row: startRow + offset, col: startCol });
        offset++;
      }
    }

    // Oznacz wszystkie zebrane punkty
    points.forEach((point, index) => {
      const key = `${point.row},${point.col}`;

      let position: 'start' | 'middle' | 'end';
      if (index === 0) {
        position = 'start';
      } else if (index === points.length - 1) {
        position = 'end';
      } else {
        position = 'middle';
      }

      this._morseLineDecisions.set(key, {
        direction,
        position
      });
    });
  }

  private _applyMorseDecision(decision: LineDecision, x: number, y: number, size: number): void {
    const radius = size / 2;

    // Zastosuj zaokrąglenia na podstawie decyzji
    if (decision.direction === 'single') {
      this._basicDot({ x, y, size, rotation: 0 });
      return;
    }

    // Środkowe elementy - użyj odpowiedniej metody w zależności od kierunku
    if (decision.position === 'middle') {
      if (decision.direction === 'horizontal') {
        this._basicRectHorizontalLine({ x, y, size, rotation: 0 });
      } else {
        this._basicRectVerticalLine({ x, y, size, rotation: 0 });
      }
      return;
    }

    if (decision.direction === 'horizontal') {
      if (decision.position === 'start') {
        // Początek linii poziomej - zaokrąglij lewą stronę, rozciągnij w prawo
        this._basicRoundedRectMorseHorizontal({
          x,
          y,
          size,
          rotation: 0,
          topLeft: radius,
          bottomLeft: radius,
          topRight: 0,
          bottomRight: 0,
          extendRight: true
        });
      } else {
        // Koniec linii poziomej - zaokrąglij prawą stronę, rozciągnij w lewo
        this._basicRoundedRectMorseHorizontal({
          x,
          y,
          size,
          rotation: 0,
          topLeft: 0,
          bottomLeft: 0,
          topRight: radius,
          bottomRight: radius,
          extendRight: false
        });
      }
      return;
    }

    // vertical
    if (decision.position === 'start') {
      // Początek linii pionowej - zaokrąglij górną stronę, rozciągnij w dół
      this._basicRoundedRectMorseVertical({
        x,
        y,
        size,
        rotation: 0,
        topLeft: radius,
        topRight: radius,
        bottomLeft: 0,
        bottomRight: 0,
        extendDown: true
      });
    } else {
      // Koniec linii pionowej - zaokrąglij dolną stronę, rozciągnij w górę
      this._basicRoundedRectMorseVertical({
        x,
        y,
        size,
        rotation: 0,
        topLeft: 0,
        topRight: 0,
        bottomLeft: radius,
        bottomRight: radius,
        extendDown: false
      });
    }
  }
}
