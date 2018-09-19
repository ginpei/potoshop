// this depends on PainMenu.css
import { Color } from 'csstype';
import * as React from 'react';

export function PaintMenuContent (props: any) {
  return (
    <div className="PaintMenu-content">
      {props.children}
    </div>
  );
}

export function PaintMenuClose (props: any) {
  return (
    <div className="PaintMenu-close">
      <i className="fa fa-times" aria-hidden="true" />
    </div>
  );
}

export function PaintMenuBody (props: any) {
  return (
    <div className="PaintMenu-body">
      {props.children}
    </div>
  );
}

export function PaintMenuFooter (props: any) {
  return (
    <div className="PaintMenu-footer">
      {props.children}
    </div>
  );
}

export function PaintMenuFooterButton (props: any) {
  const { children, className = '', ...rest } = props;

  return (
    <button
      className={`PaintMenu-footerButton ${className}`}
      {...rest}
      >{children}</button>
  );
}

interface IStrokeWidthButtonProps {
  width: number;
  onClick: (width: number) => void;
}
function StrokeWidth (props: IStrokeWidthButtonProps) {
  const path = `
    M 40 10
    L 10 40
  `;
  const onClick = () => props.onClick(props.width);
  return (
    <span className="StrokeWidth">
      <button className="StrokeWidth-button"
        onClick={onClick}
        >
          <svg width="50" height="50">
            <path
              stroke="#333"
              strokeWidth={props.width}
              d={path}
              />
          </svg>
        </button>
    </span>
  );
}

interface IStrokeWidthsButtonProps {
  strokeWidths: number[];
  onChange: (width: number) => void;
}
export function StrokeWidths (props: IStrokeWidthsButtonProps) {
  const onClick = (width: number) => {
    props.onChange(width);
  };

  const buttons = props.strokeWidths.map((width: number) => {
    return (
      <StrokeWidth
        key={width}
        width={width}
        onClick={onClick}
        />
    );
  });

  return (
    <div className="StrokeWidths">
      {buttons}
    </div>
  );
}

interface IColorButtonProps {
  color: Color;
  onClick: (color: Color) => void;
}
function ColorButton (props: IColorButtonProps) {
  const onClick = () => props.onClick(props.color);
  return (
    <span className="ColorButton">
      <button className="ColorButton-button"
        style={{ backgroundColor: props.color }}
        onClick={onClick}
        >{props.color}</button>
    </span>
  );
}

interface IColorsProps {
  colors: string[];
  onChange: (color: Color) => void;
}
export function Colors (props: IColorsProps) {
  const onClick = (color: Color) => {
    props.onChange(color);
  };

  const buttons = props.colors.map((color) => (
      <ColorButton
        key={color}
        color={color}
        onClick={onClick}
        />
  ));

  return (
    <div className="PaintMenu-colors">
      {buttons}
    </div>
  );
}
