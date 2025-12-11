import { Post } from "@/types/listing";
import { formatPriceXAF } from "./storage";
import { format } from "date-fns";

interface ShareImageOptions {
  post: Post;
  sellerInitials?: string;
  isVerified?: boolean;
}

export function generateShareCaption(post: Post): string {
  const url = `${window.location.origin}/p/${post.id}`;
  
  let caption = `${post.title} — ${formatPriceXAF(post.price)}`;
  
  if (post.isPreOrder && post.expectedArrival) {
    caption += `\n🕑 PRE-ORDER — Expected: ${format(new Date(post.expectedArrival), "PPP")}`;
  }
  
  caption += `\n${post.description || ""}

🔒 Pay securely with ProList — your money is safe until delivery is confirmed.

View details & purchase safely:
${url}`;
  
  return caption;
}

export async function generateShareImage(options: ShareImageOptions): Promise<Blob> {
  const { post, sellerInitials, isVerified } = options;
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  
  // Canvas size: 1080x1080 (Instagram/WhatsApp optimized)
  const size = 1080;
  const outerPadding = 32;
  const innerSpacing = 16;
  canvas.width = size;
  canvas.height = size;
  
  // Background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, size, size);
  
  // Draw soft diagonal security pattern (4-6px lines, 3-5% opacity)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 5;
  for (let i = -size; i < size * 2; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
  
  // Secondary diagonal pattern for depth
  ctx.strokeStyle = "rgba(16, 185, 129, 0.03)";
  ctx.lineWidth = 4;
  for (let i = -size; i < size * 2; i += 48) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
  
  // Draw product image if available
  const imageSize = 680;
  const imageX = (size - imageSize) / 2;
  const imageY = 180;
  
  if (post.imageUrl) {
    try {
      const img = await loadImage(post.imageUrl);
      
      // Draw rounded rect clip (24px radius)
      ctx.save();
      roundRect(ctx, imageX, imageY, imageSize, imageSize, 24);
      ctx.clip();
      
      // Draw image (cover fit - do not stretch)
      const imgRatio = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      
      if (imgRatio > 1) {
        sw = img.height;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width;
        sy = (img.height - sh) / 2;
      }
      
      ctx.drawImage(img, sx, sy, sw, sh, imageX, imageY, imageSize, imageSize);
      ctx.restore();
      
      // Image border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 2;
      roundRect(ctx, imageX, imageY, imageSize, imageSize, 24);
      ctx.stroke();
    } catch {
      // Fallback gradient
      const gradient = ctx.createLinearGradient(imageX, imageY, imageX + imageSize, imageY + imageSize);
      gradient.addColorStop(0, "#0ea5e9");
      gradient.addColorStop(0.5, "#14b8a6");
      gradient.addColorStop(1, "#10b981");
      ctx.fillStyle = gradient;
      roundRect(ctx, imageX, imageY, imageSize, imageSize, 24);
      ctx.fill();
    }
  } else {
    // Placeholder gradient
    const gradient = ctx.createLinearGradient(imageX, imageY, imageX + imageSize, imageY + imageSize);
    gradient.addColorStop(0, "#0ea5e9");
    gradient.addColorStop(0.5, "#14b8a6");
    gradient.addColorStop(1, "#10b981");
    ctx.fillStyle = gradient;
    roundRect(ctx, imageX, imageY, imageSize, imageSize, 24);
    ctx.fill();
  }
  
  // PRE-ORDER Ribbon (top-left corner) - if pre-order
  if (post.isPreOrder) {
    const ribbonWidth = 200;
    const ribbonHeight = 44;
    const ribbonX = imageX;
    const ribbonY = imageY + 16;
    
    // Ribbon gradient (#0FBF6D → #049DBF)
    const ribbonGradient = ctx.createLinearGradient(ribbonX, ribbonY, ribbonX + ribbonWidth, ribbonY);
    ribbonGradient.addColorStop(0, "#0FBF6D");
    ribbonGradient.addColorStop(1, "#049DBF");
    
    // Draw ribbon with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = ribbonGradient;
    roundRect(ctx, ribbonX, ribbonY, ribbonWidth, ribbonHeight, 12);
    ctx.fill();
    ctx.shadowColor = "transparent";
    
    // Ribbon text
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 18px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🕑 PRE-ORDER", ribbonX + ribbonWidth / 2, ribbonY + ribbonHeight / 2);
  }
  
  // Top banner with title (20px radius - polished)
  const bannerHeight = 100;
  const bannerX = outerPadding;
  const bannerY = outerPadding + innerSpacing;
  
  // Banner shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  roundRect(ctx, bannerX, bannerY, size - (outerPadding * 2), bannerHeight, 20);
  ctx.fill();
  ctx.shadowColor = "transparent";
  
  // Title text - 42px, 700 weight, #003133
  ctx.fillStyle = "#003133";
  ctx.font = "700 42px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  const titleText = truncateText(ctx, post.title, size - 200);
  ctx.fillText(titleText, size / 2, bannerY + bannerHeight / 2);
  
  // Price badge (top-right) - enhanced with outer glow and depth shadow
  const priceText = formatPriceXAF(post.price);
  ctx.font = "700 36px 'Plus Jakarta Sans', system-ui, sans-serif";
  const priceWidth = ctx.measureText(priceText).width + 48;
  const priceHeight = 56;
  const priceX = size - priceWidth - outerPadding - innerSpacing;
  const priceY = imageY - 24;
  
  // Price badge outer glow (20% #0FBF6D)
  ctx.shadowColor = "rgba(15, 191, 109, 0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Price badge gradient (#0FBF6D → #049DBF)
  const priceGradient = ctx.createLinearGradient(priceX, priceY, priceX + priceWidth, priceY + priceHeight);
  priceGradient.addColorStop(0, "#0FBF6D");
  priceGradient.addColorStop(1, "#049DBF");
  
  ctx.fillStyle = priceGradient;
  roundRect(ctx, priceX, priceY, priceWidth, priceHeight, 16);
  ctx.fill();
  
  // Depth shadow for price badge
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = priceGradient;
  roundRect(ctx, priceX, priceY, priceWidth, priceHeight, 16);
  ctx.fill();
  
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 36px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(priceText, priceX + priceWidth / 2, priceY + priceHeight / 2 + 2);
  
  // Seller identity bar (bottom-left of image)
  const sellerBarHeight = 64;
  const sellerBarWidth = 320;
  const sellerY = imageY + imageSize - sellerBarHeight - innerSpacing;
  const sellerX = imageX + innerSpacing;
  
  // Semi-transparent dark background
  ctx.fillStyle = "rgba(0, 49, 51, 0.88)";
  roundRect(ctx, sellerX, sellerY, sellerBarWidth, sellerBarHeight, 12);
  ctx.fill();
  
  // Circular avatar (44px)
  const avatarSize = 44;
  const avatarX = sellerX + 12;
  const avatarY = sellerY + (sellerBarHeight - avatarSize) / 2;
  
  // Avatar gradient background
  const avatarGradient = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
  avatarGradient.addColorStop(0, "#049DBF");
  avatarGradient.addColorStop(1, "#0FBF6D");
  ctx.fillStyle = avatarGradient;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Seller initials in avatar
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 20px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sellerInitials || "PL", avatarX + avatarSize / 2, avatarY + avatarSize / 2);
  
  // Seller name - bold, high contrast white
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 22px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  
  const sellerNameX = avatarX + avatarSize + 12;
  
  // Draw seller name with verified badge inline
  if (isVerified) {
    const nameText = truncateText(ctx, post.sellerName, 140);
    const nameWidth = ctx.measureText(nameText).width;
    ctx.fillText(nameText, sellerNameX, sellerY + sellerBarHeight / 2 - 8);
    
    // Verified badge inline (#0AA66D) - right of name
    const badgeX = sellerNameX + nameWidth + 8;
    const badgeY = sellerY + sellerBarHeight / 2 - 18;
    ctx.fillStyle = "#0AA66D";
    roundRect(ctx, badgeX, badgeY, 20, 20, 10);
    ctx.fill();
    
    // Checkmark in badge
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 12px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓", badgeX + 10, badgeY + 11);
    
    // "Verified" text below
    ctx.fillStyle = "#0AA66D";
    ctx.font = "600 12px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Verified", sellerNameX, sellerY + sellerBarHeight / 2 + 12);
  } else {
    ctx.fillText(truncateText(ctx, post.sellerName, 180), sellerNameX, sellerY + sellerBarHeight / 2);
  }
  
  // Premium trust badge at bottom (full design spec)
  const trustBadgeY = size - 95;
  const trustBadgeWidth = 380;
  const trustBadgeHeight = 52;
  const trustBadgeX = (size - trustBadgeWidth) / 2;
  
  // Trust badge background (#F1FFF7) with subtle shadow
  ctx.shadowColor = "rgba(15, 191, 109, 0.2)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#F1FFF7";
  roundRect(ctx, trustBadgeX, trustBadgeY, trustBadgeWidth, trustBadgeHeight, 26);
  ctx.fill();
  ctx.shadowColor = "transparent";
  
  // Trust badge border
  ctx.strokeStyle = "rgba(15, 191, 109, 0.25)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, trustBadgeX, trustBadgeY, trustBadgeWidth, trustBadgeHeight, 26);
  ctx.stroke();
  
  // Trust badge lock icon with gradient (draw a simple lock shape)
  const lockX = trustBadgeX + 20;
  const lockY = trustBadgeY + trustBadgeHeight / 2;
  
  // Lock gradient
  const lockGradient = ctx.createLinearGradient(lockX, lockY - 12, lockX + 24, lockY + 12);
  lockGradient.addColorStop(0, "#0FBF6D");
  lockGradient.addColorStop(1, "#049DBF");
  ctx.fillStyle = lockGradient;
  
  // Draw lock body
  roundRect(ctx, lockX, lockY - 6, 18, 14, 3);
  ctx.fill();
  
  // Draw lock shackle
  ctx.strokeStyle = lockGradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(lockX + 9, lockY - 6, 6, Math.PI, 0);
  ctx.stroke();
  
  // Trust badge text - 500 weight, #003133, center aligned
  ctx.fillStyle = "#003133";
  ctx.font = "500 22px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Protected by ProList Escrow", size / 2 + 12, trustBadgeY + trustBadgeHeight / 2);
  
  // Short link at bottom - 24px, 600 weight, #049DBF with 🔗 icon
  const shortUrl = `🔗 prolist.cm/p/${post.id.slice(0, 8)}`;
  ctx.fillStyle = "#049DBF";
  ctx.font = "600 24px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(shortUrl, size / 2, size - outerPadding);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create image blob"));
    }, "image/png", 1.0);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  let width = ctx.measureText(text).width;
  if (width <= maxWidth) return text;
  
  let truncated = text;
  while (width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
    width = ctx.measureText(truncated + "…").width;
  }
  return truncated + "…";
}

export async function sharePost(post: Post, isVerified = false): Promise<void> {
  const caption = generateShareCaption(post);
  
  try {
    // Copy caption to clipboard first
    await navigator.clipboard.writeText(caption);
    
    // Generate image
    const sellerInitials = post.sellerName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    const imageBlob = await generateShareImage({ post, sellerInitials, isVerified });
    const imageFile = new File([imageBlob], `${post.title.replace(/\s+/g, "-")}.png`, { type: "image/png" });
    
    // Try native share with file
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      await navigator.share({
        files: [imageFile],
        text: caption,
      });
    } else {
      // Fallback: download image
      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${post.title.replace(/\s+/g, "-")}-prolist.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return Promise.resolve(); // Return success - toast handled by caller
    }
  } catch (error) {
    console.error("Share error:", error);
    throw error;
  }
}