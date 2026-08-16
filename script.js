const {
  gsap,
  gsap: { set, to, timeline },
  MorphSVGPlugin,
  Draggable
} = window;

gsap.registerPlugin(MorphSVGPlugin);


/* =========================================================
   AUDIO
========================================================= */

const AUDIO = {
  CLICK: new Audio(
    'https://assets.codepen.io/605876/click.mp3'
  )
};


/* =========================================================
   LAMP
========================================================= */

const ON = document.querySelector('#on');
const OFF = document.querySelector('#off');

let startX;
let startY;

const PROXY = document.createElement('div');

const CORDS = gsap.utils.toArray('.cords path');

const CORD_DURATION = 0.1;

const HIT = document.querySelector('.lamp__hit');

const DUMMY_CORD =
  document.querySelector('.cord--dummy');

const ENDX = DUMMY_CORD
  ? DUMMY_CORD.getAttribute('x2')
  : 0;

const ENDY = DUMMY_CORD
  ? DUMMY_CORD.getAttribute('y2')
  : 0;


const RESET = () => {

  set(PROXY, {
    x: ENDX,
    y: ENDY
  });

};

RESET();


/* =========================================================
   STATE
========================================================= */

const STATE = {
  ON: false
};


/* =========================================================
   LAMP INITIAL
========================================================= */

gsap.set(['.cords', HIT], {
  x: -10
});

gsap.set('.lamp__eye', {
  rotate: 180,
  transformOrigin: '50% 50%',
  yPercent: 50
});


/* =========================================================
   PCB CANVAS
========================================================= */

const pcbCanvas =
  document.getElementById('pcb-bg');

const pcbCtx =
  pcbCanvas
    ? pcbCanvas.getContext('2d')
    : null;


let pcbWidth = 0;
let pcbHeight = 0;


/* =========================================================
   DOT / STAR GRID
========================================================= */

let pcbDots = [];

const DOT_SPACING = 28;


/* =========================================================
   MOUSE
========================================================= */

let pcbMouse = {
  x: -1000,
  y: -1000
};


/* =========================================================
   BLOCKED AREAS
========================================================= */

let blockedRects = [];


/* =========================================================
   INTRO
========================================================= */

let introFinished = false;

let introRunning = false;


/* =========================================================
   NAME POSITION
========================================================= */

let namePosition = {
  x: 0,
  y: 0
};


/* =========================================================
   STARS
========================================================= */

let stars = [];


/* =========================================================
   CONFIGURATION
========================================================= */

const INTRO = {

  /* الاسم */
  nameDuration: 3500,

  /* النجوم تفضل ظاهرة لمدة ثانيتين */
  starsDuration: 2000,

  /* تحول النجوم لنقط بالسلو موشن (1.4 ثانية) */
  transformDuration: 1400,

  /* النقط تفضل ظاهرة */
  dotsDuration: 1000,

  /* Fade Out */
  fadeDuration: 600,

  /* تأثير الماوس */
  mouseRadius: 135,

  /* حجم النجمة في الإنترو */
  starSize: 2.8,

  /* حجم النجمة التفاعلية مع الماوس */
  dotSize: 1.6

};


/* =========================================================
   BLOCKED UI ZONES
========================================================= */

function updateBlockedUIZones() {

  blockedRects = [];

  const selectors = [

    '.glass-card',
    '.card',
    '.profile-card',
    '.tab-content',
    '.lamp',
    'nav',
    'header',
    'form',
    '.sidebar',
    '.main-card',
    '.project-card',
    '.contact-form'

  ];


  selectors.forEach(selector => {

    document
      .querySelectorAll(selector)
      .forEach(el => {

        const rect =
          el.getBoundingClientRect();


        if (
          rect.width > 0 &&
          rect.height > 0
        ) {

          blockedRects.push({

            left:
              rect.left - 12,

            top:
              rect.top - 12,

            right:
              rect.right + 12,

            bottom:
              rect.bottom + 12

          });

        }

      });

  });

}


/* =========================================================
   CHECK BLOCKED
========================================================= */

function isInsideBlockedZone(x, y) {

  return blockedRects.some(rect => {

    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );

  });

}


/* =========================================================
   NAME POSITION
========================================================= */

function updateNamePosition() {

  const lamp =
    document.querySelector('.lamp');


  if (lamp) {

    const rect =
      lamp.getBoundingClientRect();


    if (rect.width > 0 && rect.height > 0) {

      namePosition.x =
        rect.left + (rect.width / 2);

      namePosition.y =
        Math.max(20, rect.top - 80);

      return;

    }

  }


  namePosition.x = 120;

  namePosition.y = 30;

}


/* =========================================================
   RESIZE
========================================================= */

function resizePcbCanvas() {

  if (!pcbCanvas) return;


  pcbWidth =
    pcbCanvas.width =
      window.innerWidth;


  pcbHeight =
    pcbCanvas.height =
      window.innerHeight;


  updateBlockedUIZones();

  updateNamePosition();

  createDotGrid();

}


/* =========================================================
   CREATE DOT/STAR GRID
========================================================= */

function createDotGrid() {

  pcbDots = [];


  for (
    let x = DOT_SPACING / 2;
    x < pcbWidth;
    x += DOT_SPACING
  ) {

    for (
      let y = DOT_SPACING / 2;
      y < pcbHeight;
      y += DOT_SPACING
    ) {

      if (
        isInsideBlockedZone(
          x,
          y
        )
      ) {

        continue;

      }


      pcbDots.push({

        x: x,

        y: y,

        alpha: 0,

        targetAlpha: 0,

        radius:
          INTRO.dotSize,

        targetRadius:
          INTRO.dotSize,

        /* زيادة الشفافية الأساسية للنجوم لتصبح أوضح (0.35 إلى 0.45) */
        baseAlpha:
          0.35 +
          Math.random() * 0.1,

        mousePower: 0

      });

    }

  }

}


/* =========================================================
   CREATE MANY SMALL STARS
========================================================= */

function createStars() {

  stars = [];

  const spacing = 35;


  for (
    let x = spacing / 2;
    x < pcbWidth;
    x += spacing
  ) {

    for (
      let y = spacing / 2;
      y < pcbHeight;
      y += spacing
    ) {

      const sx =
        x +
        (Math.random() - 0.5) *
        22;


      const sy =
        y +
        (Math.random() - 0.5) *
        22;


      if (
        isInsideBlockedZone(
          sx,
          sy
        )
      ) {

        continue;

      }


      if (
        Math.random() >
        0.40
      ) {

        continue;

      }


      stars.push({

        x: sx,

        y: sy,

        alpha: 0,

        scale: 0,

        rotation:
          Math.random() *
          Math.PI,

        delay:
          Math.random() *
          350

      });

    }

  }

}


/* =========================================================
   DRAW NAME
========================================================= */

function drawName(alpha = 1) {

  if (!pcbCtx) return;


  const fontSize =
    Math.min(
      28,
      Math.max(
        18,
        pcbWidth * 0.022
      )
    );


  pcbCtx.save();


  pcbCtx.globalAlpha =
    alpha;


  pcbCtx.textAlign =
    'center';


  pcbCtx.textBaseline =
    'middle';


  pcbCtx.font =
    `700 ${fontSize}px Arial, sans-serif`;


  pcbCtx.shadowColor =
    'rgba(255, 210, 80, 0.95)';

  pcbCtx.shadowBlur =
    20;


  pcbCtx.fillStyle =
    '#ffdb6e';


  pcbCtx.fillText(
    'Eng: Khaled Nsr',
    namePosition.x,
    namePosition.y
  );


  pcbCtx.shadowBlur =
    4;


  pcbCtx.fillStyle =
    'rgba(255,245,195,0.65)';


  pcbCtx.fillText(
    'Eng: Khaled Nsr',
    namePosition.x,
    namePosition.y - 0.5
  );


  pcbCtx.restore();

}


/* =========================================================
   DRAW SMALL STAR (INTRO)
========================================================= */

function drawStar(
  star,
  alpha = 1,
  scale = 1
) {

  if (!pcbCtx) return;


  const outer =
    INTRO.starSize *
    scale;


  const inner =
    outer *
    0.42;


  pcbCtx.save();


  pcbCtx.globalAlpha =
    alpha;


  pcbCtx.beginPath();


  for (
    let i = 0;
    i < 10;
    i++
  ) {

    const angle =
      -Math.PI / 2 +
      i * Math.PI / 5 +
      star.rotation;


    const radius =
      i % 2 === 0
        ? outer
        : inner;


    const x =
      star.x +
      Math.cos(angle) *
      radius;


    const y =
      star.y +
      Math.sin(angle) *
      radius;


    if (i === 0) {

      pcbCtx.moveTo(
        x,
        y
      );

    } else {

      pcbCtx.lineTo(
        x,
        y
      );

    }

  }


  pcbCtx.closePath();


  pcbCtx.strokeStyle =
    '#ffdb6e';


  pcbCtx.lineWidth =
    1.2;


  pcbCtx.lineJoin =
    'round';


  pcbCtx.shadowColor =
    'rgba(255,219,110,0.8)';


  pcbCtx.shadowBlur =
    6;


  pcbCtx.stroke();


  pcbCtx.restore();

}


/* =========================================================
   DRAW INTERACTIVE STAR (رسم نجوم تفاعلية بدل النقط)
========================================================= */

function drawDot(dot) {

  if (
    dot.alpha <=
    0.004
  ) {

    return;

  }


  pcbCtx.save();

  pcbCtx.globalAlpha =
    Math.min(1, dot.alpha);


  const outer =
    Math.max(1.8, dot.radius * 1.8);

  const inner =
    outer * 0.35;


  /* رسم نجمة رباعية خفيفة وأنيقة */
  pcbCtx.beginPath();

  for (let i = 0; i < 8; i++) {

    const angle = (i * Math.PI) / 4;

    const r = (i % 2 === 0) ? outer : inner;

    const x = dot.x + Math.cos(angle) * r;

    const y = dot.y + Math.sin(angle) * r;


    if (i === 0) {

      pcbCtx.moveTo(x, y);

    } else {

      pcbCtx.lineTo(x, y);

    }

  }

  pcbCtx.closePath();


  pcbCtx.fillStyle = '#ffdb6e';


  /* تقوية تأثير الإضاءة والتوهج */
  if (dot.alpha > 0.2) {

    pcbCtx.shadowBlur = 8;

    pcbCtx.shadowColor = 'rgba(255, 219, 110, 0.9)';

  } else {

    pcbCtx.shadowBlur = 0;

  }


  pcbCtx.fill();

  pcbCtx.restore();

}


/* =========================================================
   INTRO
========================================================= */

function startIntro() {

  if (
    !STATE.ON ||
    introRunning
  ) {

    return;

  }


  introRunning =
    true;

  introFinished =
    false;


  createStars();


  const start =
    performance.now();


  function renderIntro(now) {

    if (!STATE.ON) {

      introRunning =
        false;

      return;

    }


    const elapsed =
      now - start;


    /* 1: NAME - 3.5 SECONDS */
    if (
      elapsed <
      INTRO.nameDuration
    ) {

      updateNamePosition();


      let alpha = 1;


      if (
        elapsed <
        350
      ) {

        alpha =
          elapsed / 350;

      }


      if (
        elapsed >
        INTRO.nameDuration - 350
      ) {

        alpha =
          (
            INTRO.nameDuration -
            elapsed
          ) / 350;

      }


      drawName(
        Math.max(
          0,
          Math.min(
            1,
            alpha
          )
        )
      );

    }


    /* 2: STARS - 2 SECONDS */
    else if (
      elapsed <
      INTRO.nameDuration +
      INTRO.starsDuration
    ) {

      const phaseStart =
        INTRO.nameDuration;


      const phaseTime =
        elapsed -
        phaseStart;


      stars.forEach(star => {

        const local =
          Math.max(
            0,
            Math.min(
              1,
              (
                phaseTime -
                star.delay
              ) / 350
            )
          );


        const eased =
          1 -
          Math.pow(
            1 - local,
            3
          );


        star.alpha =
          eased;


        star.scale =
          eased;


        drawStar(
          star,
          star.alpha,
          star.scale
        );

      });

    }


    /* 3: SLOW MOTION TRANSITION */
    else if (
      elapsed <
      INTRO.nameDuration +
      INTRO.starsDuration +
      INTRO.transformDuration
    ) {

      const phaseStart =
        INTRO.nameDuration +
        INTRO.starsDuration;


      const progress =
        (
          elapsed -
          phaseStart
        ) /
        INTRO.transformDuration;


      const smooth =
        progress *
        progress *
        (
          3 -
          2 * progress
        );


      stars.forEach(star => {

        drawStar(
          star,

          1 - smooth * 0.85,

          1 - smooth * 0.75

        );

      });


      pcbDots.forEach(dot => {

        dot.targetAlpha =
          dot.baseAlpha *
          smooth;


        dot.targetRadius =
          INTRO.dotSize;

      });

    }


    /* 4: DOTS/STARS STAY */
    else if (
      elapsed <
      INTRO.nameDuration +
      INTRO.starsDuration +
      INTRO.transformDuration +
      INTRO.dotsDuration
    ) {

      pcbDots.forEach(dot => {

        dot.targetAlpha =
          dot.baseAlpha;

        dot.targetRadius =
          INTRO.dotSize;

      });

    }


    /* 5: DOTS/STARS FADE OUT */
    else if (
      elapsed <
      INTRO.nameDuration +
      INTRO.starsDuration +
      INTRO.transformDuration +
      INTRO.dotsDuration +
      INTRO.fadeDuration
    ) {

      const phaseStart =
        INTRO.nameDuration +
        INTRO.starsDuration +
        INTRO.transformDuration +
        INTRO.dotsDuration;


      const progress =
        (
          elapsed -
          phaseStart
        ) /
        INTRO.fadeDuration;


      const fade =
        1 - progress;


      pcbDots.forEach(dot => {

        dot.targetAlpha =
          dot.baseAlpha *
          fade;

      });

    }


    /* 6: INTRO FINISHED */
    else {

      introRunning =
        false;

      introFinished =
        true;


      pcbDots.forEach(dot => {

        dot.alpha =
          0;

        dot.targetAlpha =
          0;

      });


      return;

    }


    requestAnimationFrame(
      renderIntro
    );

  }


  requestAnimationFrame(
    renderIntro
  );

}


/* =========================================================
   MOUSE EFFECT (تقوية السطوع والـ Alpha للنجوم التفاعلية)
========================================================= */

function updateMouseEffect() {

  if (!STATE.ON) {
    return;
  }


  pcbDots.forEach(dot => {

    const dx =
      pcbMouse.x -
      dot.x;


    const dy =
      pcbMouse.y -
      dot.y;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    const radius =
      INTRO.mouseRadius;


    if (
      distance <
      radius
    ) {

      const power =
        1 -
        distance / radius;


      const smooth =
        power * power;


      dot.mousePower +=
        (
          smooth -
          dot.mousePower
        ) *
        0.16;


      /* الشفافية تبدأ من 0.38 وتصل لـ 0.95 بالقرب من الماوس */
      dot.targetAlpha =
        0.38 +
        dot.mousePower *
        0.57;


      dot.targetRadius =
        INTRO.dotSize +
        dot.mousePower *
        2.2;

    } else {

      dot.mousePower +=
        (
          0 -
          dot.mousePower
        ) *
        0.12;


      if (introFinished) {

        dot.targetAlpha =
          0;

        dot.targetRadius =
          INTRO.dotSize;

      }

    }

  });

}


/* =========================================================
   MOUSE MOVE
========================================================= */

window.addEventListener(
  'mousemove',
  e => {

    pcbMouse.x =
      e.clientX;

    pcbMouse.y =
      e.clientY;

  }
);


/* =========================================================
   TOUCH
========================================================= */

window.addEventListener(
  'touchmove',
  e => {

    if (
      e.touches.length > 0
    ) {

      pcbMouse.x =
        e.touches[0].clientX;

      pcbMouse.y =
        e.touches[0].clientY;

    }

  },
  {
    passive: true
  }
);


/* =========================================================
   MAIN CANVAS LOOP
========================================================= */

function animatePcbGrid() {

  if (!pcbCtx) {
    return;
  }


  pcbCtx.clearRect(
    0,
    0,
    pcbWidth,
    pcbHeight
  );


  if (!STATE.ON) {

    requestAnimationFrame(
      animatePcbGrid
    );

    return;

  }


  updateMouseEffect();


  pcbDots.forEach(dot => {

    dot.alpha +=
      (
        dot.targetAlpha -
        dot.alpha
      ) *
      0.08;


    dot.radius +=
      (
        dot.targetRadius -
        dot.radius
      ) *
      0.08;


    drawDot(dot);

  });


  pcbCtx.shadowBlur =
    0;


  requestAnimationFrame(
    animatePcbGrid
  );

}


/* =========================================================
   POWER ON
========================================================= */

function triggerPowerOnBoot() {

  introFinished =
    false;

  introRunning =
    false;


  pcbDots.forEach(dot => {

    dot.alpha = 0;

    dot.targetAlpha = 0;

    dot.radius =
      INTRO.dotSize;

    dot.targetRadius =
      INTRO.dotSize;

  });


  setTimeout(
    () => {

      if (STATE.ON) {

        startIntro();

      }

    },
    100
  );

}


/* =========================================================
   POWER OFF
========================================================= */

function resetPCB() {

  introFinished =
    false;

  introRunning =
    false;

  stars = [];


  pcbDots.forEach(dot => {

    dot.alpha = 0;

    dot.targetAlpha = 0;

    dot.radius =
      INTRO.dotSize;

    dot.targetRadius =
      INTRO.dotSize;

    dot.mousePower =
      0;

  });

}


/* =========================================================
   CORD TIMELINE
========================================================= */

const CORD_TL =
  timeline({

    paused: true,


    onStart: () => {

      STATE.ON =
        !STATE.ON;


      set(
        document.documentElement,
        {
          '--on':
            STATE.ON
              ? 1
              : 0
        }
      );


      set(
        document.documentElement,
        {
          '--shade-hue':
            gsap.utils.random(
              0,
              359
            )
        }
      );


      set(
        '.lamp__eye',
        {
          rotate:
            STATE.ON
              ? 0
              : 180
        }
      );


      set(
        [
          DUMMY_CORD,
          HIT
        ],
        {
          display:
            'none'
        }
      );


      set(
        CORDS[0],
        {
          display:
            'block'
        }
      );


      AUDIO.CLICK
        .play()
        .catch(
          () => {}
        );


      if (STATE.ON) {

        if (ON) {

          ON.setAttribute(
            'checked',
            true
          );

        }


        if (OFF) {

          OFF.removeAttribute(
            'checked'
          );

        }


        document.body
          .classList
          .add(
            'is-on'
          );


        triggerPowerOnBoot();

      } else {

        if (ON) {

          ON.removeAttribute(
            'checked'
          );

        }


        if (OFF) {

          OFF.setAttribute(
            'checked',
            true
          );

        }


        document.body
          .classList
          .remove(
            'is-on'
          );


        resetPCB();

      }

    },


    onComplete: () => {

      set(
        [
          DUMMY_CORD,
          HIT
        ],
        {
          display:
            'block'
        }
      );


      set(
        CORDS[0],
        {
          display:
            'none'
        }
      );


      RESET();

    }

  });


/* =========================================================
   CORD MORPH
========================================================= */

for (
  let i = 1;
  i < CORDS.length;
  i++
) {

  CORD_TL.add(

    to(
      CORDS[0],
      {

        morphSVG:
          CORDS[i],

        duration:
          CORD_DURATION,

        repeat:
          1,

        yoyo:
          true

      }
    )

  );

}


/* =========================================================
   DRAG CORD
========================================================= */

Draggable.create(
  PROXY,
  {

    trigger:
      HIT,

    type:
      'x,y',


    onPress:
      e => {

        startX =
          e.x;

        startY =
          e.y;

      },


    onDrag:
      function () {

        if (!DUMMY_CORD) {
          return;
        }


        set(
          DUMMY_CORD,
          {

            attr: {

              x2:
                this.x,

              y2:
                Math.max(
                  400,
                  this.y
                )

            }

          }
        );

      },


    onRelease:
      function (e) {

        const DISTX =
          Math.abs(
            e.x -
            startX
          );


        const DISTY =
          Math.abs(
            e.y -
            startY
          );


        const TRAVELLED =
          Math.sqrt(
            DISTX * DISTX +
            DISTY * DISTY
          );


        if (!DUMMY_CORD) {
          return;
        }


        to(
          DUMMY_CORD,
          {

            attr: {

              x2:
                ENDX,

              y2:
                ENDY

            },

            duration:
              CORD_DURATION,


            onComplete:
              () => {

                if (
                  TRAVELLED >
                  50
                ) {

                  CORD_TL.restart();

                } else {

                  RESET();

                }

              }

          }
        );

      }

  }
);


/* =========================================================
   LAMP DISPLAY
========================================================= */

gsap.set(
  '.lamp',
  {
    display:
      'block'
  }
);


/* =========================================================
   RESIZE & SCROLL
========================================================= */

window.addEventListener(
  'resize',
  () => {

    resizePcbCanvas();

    updateNamePosition();

  }
);

window.addEventListener(
  'scroll',
  () => {

    updateBlockedUIZones();

    updateNamePosition();

  }
);


/* =========================================================
   TABS
========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const navBtns =
      document.querySelectorAll(
        '.nav-btn'
      );


    const tabContents =
      document.querySelectorAll(
        '.tab-content'
      );


    navBtns.forEach(btn => {

      btn.addEventListener(
        'click',
        () => {

          navBtns.forEach(b => {

            b.classList.remove(
              'active'
            );

          });


          tabContents.forEach(content => {

            content.classList.remove(
              'active'
            );

          });


          btn.classList.add(
            'active'
          );


          const targetTab =
            btn.getAttribute(
              'data-tab'
            );


          const activeContent =
            document.getElementById(
              `tab-${targetTab}`
            );


          if (
            activeContent
          ) {

            activeContent.classList.add(
              'active'
            );

          }


          setTimeout(
            () => {

              updateBlockedUIZones();

              updateNamePosition();

            },
            150
          );

        }
      );

    });


    /* =====================================================
       FILTERS
    ===================================================== */

    const filterBtns =
      document.querySelectorAll(
        '.filter-btn'
      );


    const projectCards =
      document.querySelectorAll(
        '.project-card'
      );


    filterBtns.forEach(btn => {

      btn.addEventListener(
        'click',
        () => {

          const filterValue =
            btn.getAttribute(
              'data-filter'
            );


          filterBtns.forEach(b => {

            b.classList.remove(
              'active'
            );

          });


          btn.classList.add(
            'active'
          );


          projectCards.forEach(card => {

            if (
              filterValue ===
              'all'
            ) {

              card.style.display =
                'block';

            } else {

              card.style.display =
                card.classList.contains(
                  filterValue
                )
                  ? 'block'
                  : 'none';

            }

          });


          setTimeout(
            () => {

              updateBlockedUIZones();

              updateNamePosition();

            },
            150
          );

        }
      );

    });


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    const contactForm =
      document.querySelector(
        '.contact-form'
      );


    if (contactForm) {

      contactForm.addEventListener(
        'submit',
        async e => {

          e.preventDefault();


          const btn =
            contactForm.querySelector(
              'button[type="submit"]'
            );


          const originalText =
            btn
              ? btn.textContent
              : 'Send Message 🚀';


          if (btn) {

            btn.textContent =
              'Sending... ⏳';

            btn.disabled =
              true;

          }


          const data =
            new FormData(
              contactForm
            );


          try {

            const response =
              await fetch(
                contactForm.action,
                {

                  method:
                    contactForm.method,

                  body:
                    data,

                  headers: {

                    Accept:
                      'application/json'

                  }

                }
              );


            if (
              response.ok
            ) {

              alert(
                'Thank you, Khaled has received your message!'
              );


              contactForm.reset();

            } else {

              alert(
                'Oops! There was a problem submitting your form.'
              );

            }

          } catch (error) {

            alert(
              'Oops! There was a problem submitting your form.'
            );

          } finally {

            if (btn) {

              btn.textContent =
                originalText;

              btn.disabled =
                false;

            }

          }

        }
      );

    }

  }
);


/* =========================================================
   START CANVAS
========================================================= */

setTimeout(
  () => {

    resizePcbCanvas();

    updateBlockedUIZones();

    updateNamePosition();

    animatePcbGrid();

  },
  100
);