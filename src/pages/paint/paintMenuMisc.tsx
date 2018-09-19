// this depends on PainMenu.css
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
