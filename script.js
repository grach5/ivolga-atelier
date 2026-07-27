/* =========================================================
   ИВОЛГА — салон-ателье. Скрипты.
   Ванильный JS, без зависимостей и сборки.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Номер WhatsApp (в международном формате, без +) ---------- */
  var WHATSAPP_NUMBER = "79668683535";

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
