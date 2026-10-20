import { Globe } from "lucide-react";
import { FaFacebook, FaFacebookF, FaInstagram, FaLinkedin, FaTelegram, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";

export const PRODUCT_MEDIA_PLATFORMS = [
  { value: "telegram", labelKey: "settings.socialIconTelegram", icon: FaTelegram, color: "#229ed9", placeholder: "https://t.me/..." },
  { value: "facebook", labelKey: "settings.socialIconFacebook", icon: FaFacebook, displayIcon: FaFacebookF, color: "#1877f2", placeholder: "https://facebook.com/watch/..." },
  { value: "tiktok", labelKey: "settings.socialIconTikTok", icon: FaTiktok, color: "#111827", placeholder: "https://www.tiktok.com/@.../video/..." },
  { value: "instagram", labelKey: "settings.socialIconInstagram", icon: FaInstagram, color: "#e4405f", placeholder: "https://www.instagram.com/reel/..." },
  { value: "twitter", labelKey: "settings.socialIconTwitter", icon: FaXTwitter, color: "#111827", placeholder: "https://x.com/.../status/..." },
  { value: "youtube", labelKey: "settings.socialIconYouTube", icon: FaYoutube, color: "#ff0000", placeholder: "https://www.youtube.com/watch?v=..." },
  { value: "linkedin", labelKey: "settings.socialIconLinkedIn", icon: FaLinkedin, color: "#0a66c2", placeholder: "https://www.linkedin.com/posts/..." },
  { value: "website", labelKey: "settings.socialIconWebsite", icon: Globe, color: "#64748b", placeholder: "https://example.com/..." },
];
