// script.js

// Fuzzy Text Animation
class FuzzyText {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.text = options.text || '';
    this.fontSize = options.fontSize || '5vw';
    this.fontWeight = options.fontWeight || 900;
    this.fontFamily = options.fontFamily || 'Pagelozi, Noto Sans KR, sans-serif';
    this.color = options.color || '#fff';
    this.baseIntensity = options.baseIntensity || 0.2;
    this.hoverIntensity = options.hoverIntensity || 0.5;
    this.enableHover = options.enableHover !== false;
    
    this.animationFrameId = null;
    this.isHovering = false;
    this.isCancelled = false;
    
    this.init();
  }
  
  async init() {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    if (this.isCancelled) return;
    
    const fontSizeStr = typeof this.fontSize === 'number' ? `${this.fontSize}px` : this.fontSize;
    let numericFontSize;
    
    if (typeof this.fontSize === 'number') {
      numericFontSize = this.fontSize;
    } else {
      const temp = document.createElement('span');
      temp.style.fontSize = this.fontSize;
      document.body.appendChild(temp);
      const computedSize = window.getComputedStyle(temp).fontSize;
      numericFontSize = parseFloat(computedSize);
      document.body.removeChild(temp);
    }
    
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    
    offCtx.font = `${this.fontWeight} ${fontSizeStr} ${this.fontFamily}`;
    offCtx.textBaseline = 'alphabetic';
    const metrics = offCtx.measureText(this.text);
    
    const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
    const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
    const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
    const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;
    
    const textBoundingWidth = Math.ceil(actualLeft + actualRight);
    const tightHeight = Math.ceil(actualAscent + actualDescent);
    
    const extraWidthBuffer = 10;
    const offscreenWidth = textBoundingWidth + extraWidthBuffer;
    
    offscreen.width = offscreenWidth;
    offscreen.height = tightHeight;
    
    const xOffset = extraWidthBuffer / 2;
    offCtx.font = `${this.fontWeight} ${fontSizeStr} ${this.fontFamily}`;
    offCtx.textBaseline = 'alphabetic';
    offCtx.fillStyle = this.color;
    offCtx.fillText(this.text, xOffset - actualLeft, actualAscent);
    
    const horizontalMargin = 50;
    const verticalMargin = 0;
    this.canvas.width = offscreenWidth + horizontalMargin * 2;
    this.canvas.height = tightHeight + verticalMargin * 2;
    this.ctx.translate(horizontalMargin, verticalMargin);
    
    const interactiveLeft = horizontalMargin + xOffset;
    const interactiveTop = verticalMargin;
    const interactiveRight = interactiveLeft + textBoundingWidth;
    const interactiveBottom = interactiveTop + tightHeight;
    
    const fuzzRange = 30;
    
    const run = () => {
      if (this.isCancelled) return;
      this.ctx.clearRect(
        -fuzzRange,
        -fuzzRange,
        offscreenWidth + 2 * fuzzRange,
        tightHeight + 2 * fuzzRange
      );
      const intensity = this.isHovering ? this.hoverIntensity : this.baseIntensity;
      for (let j = 0; j < tightHeight; j++) {
        const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
        this.ctx.drawImage(
          offscreen,
          0,
          j,
          offscreenWidth,
          1,
          dx,
          j,
          offscreenWidth,
          1
        );
      }
      this.animationFrameId = window.requestAnimationFrame(run);
    };
    
    run();
    
    const isInsideTextArea = (x, y) => {
      return (
        x >= interactiveLeft &&
        x <= interactiveRight &&
        y >= interactiveTop &&
        y <= interactiveBottom
      );
    };
    
    const handleMouseMove = (e) => {
      if (!this.enableHover) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.isHovering = isInsideTextArea(x, y);
    };
    
    const handleMouseLeave = () => {
      this.isHovering = false;
    };
    
    const handleTouchMove = (e) => {
      if (!this.enableHover) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.isHovering = isInsideTextArea(x, y);
    };
    
    const handleTouchEnd = () => {
      this.isHovering = false;
    };
    
    if (this.enableHover) {
      this.canvas.addEventListener('mousemove', handleMouseMove);
      this.canvas.addEventListener('mouseleave', handleMouseLeave);
      this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      this.canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    this.cleanup = () => {
      window.cancelAnimationFrame(this.animationFrameId);
      if (this.enableHover) {
        this.canvas.removeEventListener('mousemove', handleMouseMove);
        this.canvas.removeEventListener('mouseleave', handleMouseLeave);
        this.canvas.removeEventListener('touchmove', handleTouchMove);
        this.canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    this.canvas.cleanupFuzzyText = this.cleanup;
  }
  
  destroy() {
    this.isCancelled = true;
    window.cancelAnimationFrame(this.animationFrameId);
    if (this.canvas && this.canvas.cleanupFuzzyText) {
      this.canvas.cleanupFuzzyText();
    }
  }
}

// True Focus 효과
function trueFocusInit() {
  const container = document.querySelector('.true-focus');
  if (!container) return;
  const words = Array.from(container.querySelectorAll('.focus-word'));
  let idx = 0;
  setInterval(() => {
    words.forEach((w, i) => w.classList.toggle('active', i === idx));
    idx = (idx + 1) % words.length;
  }, 2000);
}

// Decrypted Text 효과 (loop, loop2 지원)
function decryptedTextInit() {
  document.querySelectorAll('.decrypted-text').forEach(el => {
    const target = el.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?';
    let frame = 0;
    let loop = el.classList.contains('loop');
    let loop2 = el.classList.contains('loop2');
    function decrypt() {
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (i < frame) {
          out += target[i];
        } else if (target[i] === ' ') {
          out += ' ';
        } else {
          out += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = out;
      if (frame <= target.length) {
        frame++;
        setTimeout(decrypt, 60);
      } else if (loop2) {
        setTimeout(() => {
          frame = 0;
          setTimeout(decrypt, 300);
        }, 1000);
      } else if (loop) {
        setTimeout(() => {
          frame = 0;
          setTimeout(decrypt, 500);
        }, 5000);
      }
    }
    el.textContent = '';
    setTimeout(decrypt, 600);
  });
}

// GSAP & ScrollTrigger CDN 동적 로드
(function() {
  if (!window.gsap) {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    document.head.appendChild(s);
    s.onload = function() {
      var st = document.createElement('script');
      st.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
      document.head.appendChild(st);
      st.onload = initServiceGsap;
    };
  } else {
    initServiceGsap();
  }
})();

function initServiceGsap() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const items = document.querySelectorAll('.service-gsap-item');
  const section = document.getElementById('service-scroll');
  if (!items.length || !section) return;
  // 모두 숨김
  items.forEach(i => i.classList.remove('active'));
  // 타임라인 생성
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: 'top top',
      end: '+=' + (items.length * 800),
      scrub: 0.5,
    }
  });
  items.forEach((item, idx) => {
    tl.to(item, {opacity: 1, y: 0, duration: 0.3, onStart:()=>item.classList.add('active')}, "+=0.1")
      .to(item, {opacity: 1, y: 0, duration: 0.7})
      .to(item, {opacity: 0, y: -30, duration: 0.3, onComplete:()=>item.classList.remove('active')}, "+=0.7");
  });
}

window.addEventListener('DOMContentLoaded', function() {
  trueFocusInit();
  decryptedTextInit();

  // Fuzzy Text 초기화
  initFuzzyTexts();

  // 기존 폼 JS 유지
  const form = document.querySelector('.contact form');
  if(form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const inputs = form.querySelectorAll('input, textarea');
      const data = {};
      inputs.forEach(input => {
        if(input.type === 'text' && input.placeholder === '회사/기업') data.company = input.value;
        else if(input.type === 'text' && input.placeholder === '성함') data.name = input.value;
        else if(input.type === 'tel') data.phone = input.value;
        else if(input.type === 'email') data.email = input.value;
        else if(input.type === 'text' && input.placeholder === '진행 중인 마케팅') data.marketing = input.value;
        else if(input.tagName.toLowerCase() === 'textarea') data.message = input.value;
      });
      try {
        const res = await fetch('https://hook.us2.make.com/8x8a2o5dirnouvac2qkortm2eli904de', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if(res.ok) {
          alert('문의가 정상적으로 접수되었습니다!');
          form.reset();
        } else {
          alert('문의 전송에 실패했습니다. 다시 시도해 주세요.');
        }
      } catch(err) {
        alert('문의 전송 중 오류가 발생했습니다.');
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const privacyCheck = document.getElementById('privacyCheck');
  const submitBtn = document.getElementById('submitBtn');
  if (privacyCheck && submitBtn) {
    privacyCheck.addEventListener('change', function() {
      submitBtn.disabled = !privacyCheck.checked;
    });
  }
});

// Fuzzy Text 초기화 함수
function initFuzzyTexts() {
  const worryTexts = [
    '저 마케팅 성과가 진짜일까?',
    '마케팅으로 진짜 매출이 오를까?',
    '혹시 사기 업체면 어떻게 하지?'
  ];
  
  const canvasIds = ['worry-text-1', 'worry-text-2', 'worry-text-3'];
  
  canvasIds.forEach((canvasId, index) => {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      new FuzzyText(canvas, {
        text: worryTexts[index],
        fontSize: '5vw',
        fontWeight: 900,
        fontFamily: 'Pagelozi, Noto Sans KR, sans-serif',
        color: '#fff',
        baseIntensity: 0.2,
        hoverIntensity: 0.5,
        enableHover: true
      });
    }
  });
} 