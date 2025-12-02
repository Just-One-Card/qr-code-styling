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
    constructor({ svg, type, window, dotScale }: {
        svg: SVGElement;
        type: DotType;
        window: Window;
        dotScale?: number;
    });
    draw(x: number, y: number, size: number, getNeighbor: GetNeighbor, row?: number, col?: number): void;
    _rotateFigure({ x, y, size, rotation, draw }: RotateFigureArgs): void;
    _getScaledDimensions(x: number, y: number, size: number): {
        x: number;
        y: number;
        size: number;
    };
    _basicDot(args: BasicFigureDrawArgs): void;
    _basicSquare(args: BasicFigureDrawArgs): void;
    _basicRectHorizontalLine(args: BasicFigureDrawArgs): void;
    _basicRectVerticalLine(args: BasicFigureDrawArgs): void;
    _basicSideRounded(args: BasicFigureDrawArgs): void;
    _basicCornerRounded(args: BasicFigureDrawArgs): void;
    _basicCornerExtraRounded(args: BasicFigureDrawArgs): void;
    _basicCornersRounded(args: BasicFigureDrawArgs): void;
    _basicRoundedRect(args: BasicFigureDrawArgs & {
        topLeft?: number;
        topRight?: number;
        bottomLeft?: number;
        bottomRight?: number;
    }): void;
    _basicRoundedRectMorseHorizontal(args: BasicFigureDrawArgs & {
        topLeft?: number;
        topRight?: number;
        bottomLeft?: number;
        bottomRight?: number;
        extendRight?: boolean;
    }): void;
    _basicRoundedRectMorseVertical(args: BasicFigureDrawArgs & {
        topLeft?: number;
        topRight?: number;
        bottomLeft?: number;
        bottomRight?: number;
        extendDown?: boolean;
    }): void;
    _drawDot({ x, y, size }: DrawArgs): void;
    _drawSquare({ x, y, size }: DrawArgs): void;
    _drawRounded({ x, y, size, getNeighbor }: DrawArgs): void;
    _drawExtraRounded({ x, y, size, getNeighbor }: DrawArgs): void;
    _drawClassy({ x, y, size, getNeighbor }: DrawArgs): void;
    _drawClassyRounded({ x, y, size, getNeighbor }: DrawArgs): void;
    _drawMorse({ x, y, size, getNeighbor, row, col }: DrawArgs): void;
    private _morseMarkLineFromPoint;
    private _applyMorseDecision;
}
export {};
