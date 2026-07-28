/* =========================================================
   ИВОЛГА — салон-ателье. Скрипты.
   Ванильный JS, без зависимостей и сборки.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Номер WhatsApp (в международном формате, без +) ---------- */
  var WHATSAPP_NUMBER = "79668683535";

  /* ---------- Уважаем prefers-reduced-motion: полностью отключаем JS-эффекты ---------- */
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReducedMotion = motionQuery.matches;

  /* ---------- Шапка: тень при прокрутке ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  function closeMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileNav();
    });
  }

  /* ---------- 3D-наклон карточек услуг при наведении курсора ---------- */
  if (!prefersReducedMotion) {
    var tiltCards = document.querySelectorAll(".service-card");
    var TILT_MAX_DEG = 7; // ограничение по заданию: ±6–8°

    tiltCards.forEach(function (card) {
      function handleTiltMove(e) {
        var rect = card.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width; // 0..1
        var relY = (e.clientY - rect.top) / rect.height; // 0..1

        var rotateY = (relX - 0.5) * (TILT_MAX_DEG * 2); // курсор справа → крутим вправо
        var rotateX = (0.5 - relY) * (TILT_MAX_DEG * 2); // курсор сверху → крутим вверх

        // Мягкое усиление тени в сторону, противоположную наклону — имитация источника света сверху.
        var shadowX = (relX - 0.5) * -20;
        var shadowY = (relY - 0.5) * -14;

        card.style.transform =
          "rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateZ(var(--tilt-lift))";
        card.style.boxShadow =
          shadowX.toFixed(1) + "px " + (18 - shadowY).toFixed(1) + "px 34px var(--tilt-shadow-color), var(--shadow-sm)";
      }

      function handleTiltEnter() {
        card.classList.add("is-tilting");
      }

      function handleTiltLeave() {
        card.classList.remove("is-tilting");
        card.style.transform = "";
        card.style.boxShadow = "";
      }

      card.addEventListener("mouseenter", handleTiltEnter);
      card.addEventListener("mousemove", handleTiltMove);
      card.addEventListener("mouseleave", handleTiltLeave);
    });
  }

  /* ---------- Параллакс фонового «крыла» в hero при скролле ---------- */
  var heroWingParallax = document.getElementById("heroWingParallax");
  if (heroWingParallax && !prefersReducedMotion) {
    var WING_PARALLAX_FACTOR = 0.18;
    var wingParallaxTicking = false;

    var updateWingParallax = function () {
      var offset = window.scrollY * WING_PARALLAX_FACTOR;
      heroWingParallax.style.transform = "translateY(" + offset.toFixed(1) + "px)";
      wingParallaxTicking = false;
    };

    var onWingParallaxScroll = function () {
      if (!wingParallaxTicking) {
        window.requestAnimationFrame(updateWingParallax);
        wingParallaxTicking = true;
      }
    };

    window.addEventListener("scroll", onWingParallaxScroll, { passive: true });
    updateWingParallax();
  }

  /* ---------- Форма записи → сообщение в WhatsApp ---------- */
  var form = document.getElementById("bookingForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");

  function setStatus(message, state) {
    if (!statusEl) return;
    statusEl.textContent = message;
    if (state) {
      statusEl.setAttribute("data-state", state);
    } else {
      statusEl.removeAttribute("data-state");
    }
  }

  function digitsOnly(value) {
    return (value || "").replace(/\D/g, "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", null);

      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      var comment = form.comment.value.trim();
      var consent = form.consent.checked;

      if (!name) {
        setStatus("Пожалуйста, укажите имя.", "error");
        form.name.focus();
        return;
      }
      var phoneDigits = digitsOnly(phone);
      if (phoneDigits.length < 10) {
        setStatus("Проверьте номер телефона — кажется, в нём не хватает цифр.", "error");
        form.phone.focus();
        return;
      }
      if (!consent) {
        setStatus("Нужно согласие на обработку данных, чтобы отправить заявку.", "error");
        form.consent.focus();
        return;
      }

      var lines = [
        "Здравствуйте! Заявка с сайта «Иволга».",
        "Имя: " + name,
        "Телефон: " + phone,
        "Услуга: " + service
      ];
      if (comment) {
        lines.push("Комментарий: " + comment);
      }

      var text = encodeURIComponent(lines.join("\n"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;

      if (submitBtn) submitBtn.disabled = true;
      setStatus("Открываем WhatsApp в новой вкладке…", null);

      var win = window.open(url, "_blank", "noopener,noreferrer");

      window.setTimeout(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (win) {
          setStatus("Готово! Останется отправить подготовленное сообщение в WhatsApp.", null);
        } else {
          setStatus("Не удалось открыть WhatsApp автоматически — возможно, окно заблокировано браузером. Разрешите всплывающие окна и попробуйте снова.", "error");
        }
      }, 400);
    });
  }
})();
