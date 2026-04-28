const inputClass =
  "h-14 px-6 rounded-full bg-[#0c0c0c] border border-white/[0.1] text-white placeholder:text-white/40 text-[16px] outline-none w-full focus:border-white/25 transition-colors";

export function InputFieldEmpty() {
  return <input type="email" placeholder="Work email" className={inputClass} readOnly />;
}

export function InputFieldFilled() {
  return <input type="email" defaultValue="sample@cogniate.com" className={inputClass} readOnly />;
}
