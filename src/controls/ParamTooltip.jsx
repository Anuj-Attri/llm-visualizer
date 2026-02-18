/**
 * Label with ⓘ icon that shows a tooltip on hover. Zara: tooltip black bg, white text, no radius.
 */

import { useState } from 'react';

export default function ParamTooltip({ id, label, tooltip, children }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-widest text-[#0A0A0A]">
          {label}
        </label>
        <span
          className="relative cursor-help text-[#6B6B6B] hover:text-[#0A0A0A]"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          role="img"
          aria-label="info"
        >
          <span className="text-xs">ⓘ</span>
          {show && (
            <span
              className="absolute left-0 top-6 z-50 max-w-[220px] border-0 bg-[#0A0A0A] px-2 py-1.5 text-xs font-normal text-white"
              style={{ whiteSpace: 'normal', borderRadius: 0 }}
            >
              {tooltip}
            </span>
          )}
        </span>
      </div>
      {children}
    </div>
  );
}
