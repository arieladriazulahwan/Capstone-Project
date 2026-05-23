import logo from "../assets/LOGO_SORA_KAILI.png";

function SoraKailiLogo({
  className = "w-20 h-20",
  showText = false,
  imgClassName = "",
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logo}
        alt={showText ? "Sora Kaili" : "Logo Sora Kaili"}
        className={`h-full w-full object-contain ${imgClassName}`}
      />
    </div>
  );
}

export default SoraKailiLogo;
