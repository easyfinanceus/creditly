const I18N = {
  az: {
    currency: "AZN",
    invalid: "Zəhmət olmasa bütün sahələri düzgün doldurun.",
    monthlyPayment: "Aylıq ödəniş",
    totalPayment: "Ümumi ödəniş",
    overpayment: "Faiz üzrə artıq ödəniş",
    firstPayment: "İlk ayın ödənişi",
    lastPayment: "Son ayın ödənişi",
    safePayment: "Təhlükəsiz aylıq ödəniş",
    safeLoan: "Təxmini kredit məbləği",
    dti: "Borclanma limiti",
    shortenTerm: "Müddətin qısalması",
    lowerPayment: "Yeni aylıq ödəniş",
    savedInterest: "Qənaət olunan faiz",
    converted: "Çevrilmiş məbləğ",
    shareReady: "Nəticə kopyalandı",
    shareEmpty: "Öncə hesablamanı edin",
    months: "ay",
    years: "il",
    compareMetric: "Metrika"
  },
  ru: {
    currency: "AZN",
    invalid: "Пожалуйста, корректно заполните все поля.",
    monthlyPayment: "Ежемесячный платеж",
    totalPayment: "Общая выплата",
    overpayment: "Переплата по процентам",
    firstPayment: "Платеж в первый месяц",
    lastPayment: "Платеж в последний месяц",
    safePayment: "Безопасный ежемесячный платеж",
    safeLoan: "Ориентировочная сумма кредита",
    dti: "Лимит долговой нагрузки",
    shortenTerm: "Сокращение срока",
    lowerPayment: "Новый ежемесячный платеж",
    savedInterest: "Экономия на процентах",
    converted: "Конвертированная сумма",
    shareReady: "Результат скопирован",
    shareEmpty: "Сначала выполните расчет",
    months: "мес.",
    years: "лет",
    compareMetric: "Параметр"
  },
  en: {
    currency: "AZN",
    invalid: "Please fill in all fields correctly.",
    monthlyPayment: "Monthly payment",
    totalPayment: "Total payment",
    overpayment: "Interest paid",
    firstPayment: "First month payment",
    lastPayment: "Last month payment",
    safePayment: "Safe monthly payment",
    safeLoan: "Estimated loan amount",
    dti: "Debt burden limit",
    shortenTerm: "Term reduction",
    lowerPayment: "New monthly payment",
    savedInterest: "Interest saved",
    converted: "Converted amount",
    shareReady: "Result copied",
    shareEmpty: "Run a calculation first",
    months: "months",
    years: "years",
    compareMetric: "Metric"
  }
};

const EXCHANGE_RATES = {
  AZN: 1,
  USD: 1.7,
  EUR: 1.84,
  RUB: 0.0185
};

const state = {
  shareText: ""
};

const lang = document.body.dataset.lang || "az";
const dict = I18N[lang];

const formatMoney = (value, currency = dict.currency) =>
  new Intl.NumberFormat(lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

const formatNumber = (value) =>
  new Intl.NumberFormat(lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US", {
    maximumFractionDigits: 2
  }).format(value);

function annuityPayment(principal, monthlyRate, months) {
  if (monthlyRate === 0) {
    return principal / months;
  }
  const ratio = (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return principal * ratio;
}

function calculateDifferentiated(principal, monthlyRate, months) {
  const principalPart = principal / months;
  let total = 0;
  let first = 0;
  let last = 0;
  let balance = principal;

  for (let month = 1; month <= months; month += 1) {
    const payment = principalPart + balance * monthlyRate;
    if (month === 1) first = payment;
    if (month === months) last = payment;
    total += payment;
    balance -= principalPart;
  }

  return { total, first, last };
}

function setError(formId, message = "") {
  const node = document.querySelector(`[data-error="${formId}"]`);
  if (node) node.textContent = message;
}

function setHtml(targetId, html) {
  const node = document.getElementById(targetId);
  if (node) node.innerHTML = html;
}

function saveForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem(`kreditly-${form.id}`, JSON.stringify(data));
}

function restoreForm(form) {
  const saved = localStorage.getItem(`kreditly-${form.id}`);
  if (!saved) return;
  const data = JSON.parse(saved);
  Object.entries(data).forEach(([key, value]) => {
    const control = form.elements.namedItem(key);
    if (control) control.value = value;
  });
}

function monthsToLabel(months) {
  if (months <= 0) {
    return `0 ${dict.months}`;
  }
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ${dict.years}`);
  if (remainder > 0) parts.push(`${remainder} ${dict.months}`);
  return parts.join(" ") || `1 ${dict.months}`;
}

function bindLoanCalculator() {
  const form = document.getElementById("loan-form");
  if (!form) return;
  restoreForm(form);

  const run = () => {
    const principal = Number(form.amount.value);
    const months = Number(form.months.value);
    const annualRate = Number(form.rate.value) / 100;
    const paymentType = form.paymentType.value;

    if (!(principal > 0 && months > 0 && annualRate >= 0)) {
      setError("loan", dict.invalid);
      return;
    }

    setError("loan");
    saveForm(form);
    const monthlyRate = annualRate / 12;

    if (paymentType === "annuity") {
      const monthly = annuityPayment(principal, monthlyRate, months);
      const total = monthly * months;
      const overpayment = total - principal;
      state.shareText = `${dict.monthlyPayment}: ${formatMoney(monthly)} | ${dict.totalPayment}: ${formatMoney(total)} | ${dict.overpayment}: ${formatMoney(overpayment)}`;
      setHtml(
        "loan-result",
        `
          <div class="result-row"><span>${dict.monthlyPayment}</span><strong>${formatMoney(monthly)}</strong></div>
          <div class="result-row"><span>${dict.totalPayment}</span><strong>${formatMoney(total)}</strong></div>
          <div class="result-row"><span>${dict.overpayment}</span><strong>${formatMoney(overpayment)}</strong></div>
        `
      );
      return;
    }

    const differentiated = calculateDifferentiated(principal, monthlyRate, months);
    state.shareText = `${dict.firstPayment}: ${formatMoney(differentiated.first)} | ${dict.lastPayment}: ${formatMoney(differentiated.last)} | ${dict.totalPayment}: ${formatMoney(differentiated.total)}`;
    setHtml(
      "loan-result",
      `
        <div class="result-row"><span>${dict.firstPayment}</span><strong>${formatMoney(differentiated.first)}</strong></div>
        <div class="result-row"><span>${dict.lastPayment}</span><strong>${formatMoney(differentiated.last)}</strong></div>
        <div class="result-row"><span>${dict.totalPayment}</span><strong>${formatMoney(differentiated.total)}</strong></div>
      `
    );
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });

  form.addEventListener("input", run);
  run();
}

function bindDebtCalculator() {
  const form = document.getElementById("debt-form");
  if (!form) return;
  restoreForm(form);

  const run = () => {
    const salary = Number(form.salary.value);
    const obligations = Number(form.obligations.value);
    const months = Number(form.debtMonths.value);
    const annualRate = Number(form.debtRate.value) / 100;

    if (!(salary > 0 && months > 0 && annualRate >= 0 && obligations >= 0)) {
      setError("debt", dict.invalid);
      return;
    }

    setError("debt");
    saveForm(form);
    const dtiLimit = salary * 0.4;
    const safePayment = Math.max(0, dtiLimit - obligations);
    const monthlyRate = annualRate / 12;
    const safeLoan = monthlyRate === 0
      ? safePayment * months
      : safePayment * ((Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));

    setHtml(
      "debt-result",
      `
        <div class="result-row"><span>${dict.dti}</span><strong>${formatMoney(dtiLimit)}</strong></div>
        <div class="result-row"><span>${dict.safePayment}</span><strong>${formatMoney(safePayment)}</strong></div>
        <div class="result-row"><span>${dict.safeLoan}</span><strong>${formatMoney(Math.max(0, safeLoan))}</strong></div>
      `
    );
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });
  form.addEventListener("input", run);
  run();
}

function simulateEarlyRepayment(principal, annualRate, months, extra) {
  const monthlyRate = annualRate / 12;
  const basePayment = annuityPayment(principal, monthlyRate, months);
  const baseTotal = basePayment * months;
  let balance = principal;
  let shortenMonths = 0;
  let shortenTotal = 0;

  while (balance > 0.01 && shortenMonths < 1200) {
    const interest = balance * monthlyRate;
    const payment = Math.min(balance + interest, basePayment + extra);
    balance = balance + interest - payment;
    shortenTotal += payment;
    shortenMonths += 1;
  }

  let recastBalance = principal;
  let paymentNow = basePayment;
  let lowerTotal = 0;

  for (let remaining = months; remaining > 0; remaining -= 1) {
    if (recastBalance <= 0.01) break;
    paymentNow = annuityPayment(recastBalance, monthlyRate, remaining);
    const interest = recastBalance * monthlyRate;
    const payment = Math.min(recastBalance + interest, paymentNow + extra);
    recastBalance = recastBalance + interest - payment;
    lowerTotal += payment;
  }

  const nextPayment = months > 1
    ? annuityPayment(
        Math.max(0, principal + principal * monthlyRate - (basePayment + extra)),
        monthlyRate,
        months - 1
      )
    : 0;

  return {
    baseTotal,
    shortenMonths,
    shortenSaved: baseTotal - shortenTotal,
    nextPayment,
    lowerSaved: baseTotal - lowerTotal
  };
}

function bindEarlyRepayment() {
  const form = document.getElementById("early-form");
  if (!form) return;
  restoreForm(form);

  const run = () => {
    const principal = Number(form.earlyAmount.value);
    const months = Number(form.earlyMonths.value);
    const annualRate = Number(form.earlyRate.value) / 100;
    const extra = Number(form.extraPayment.value);

    if (!(principal > 0 && months > 0 && annualRate >= 0 && extra >= 0)) {
      setError("early", dict.invalid);
      return;
    }

    setError("early");
    saveForm(form);
    const result = simulateEarlyRepayment(principal, annualRate, months, extra);
    setHtml(
      "early-result",
      `
        <div class="result-row"><span>${dict.shortenTerm}</span><strong>${monthsToLabel(Math.max(1, months - result.shortenMonths))}</strong></div>
        <div class="result-row"><span>${dict.lowerPayment}</span><strong>${formatMoney(result.nextPayment)}</strong></div>
        <div class="result-row"><span>${dict.savedInterest}</span><strong>${formatMoney(Math.max(result.shortenSaved, result.lowerSaved))}</strong></div>
      `
    );
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });
  form.addEventListener("input", run);
  run();
}

function bindCurrencyConverter() {
  const form = document.getElementById("currency-form");
  if (!form) return;
  restoreForm(form);

  const run = () => {
    const amount = Number(form.convertAmount.value);
    const from = form.fromCurrency.value;
    const to = form.toCurrency.value;

    if (!(amount > 0 && EXCHANGE_RATES[from] && EXCHANGE_RATES[to])) {
      setError("currency", dict.invalid);
      return;
    }

    setError("currency");
    saveForm(form);
    const aznValue = amount * EXCHANGE_RATES[from];
    const converted = aznValue / EXCHANGE_RATES[to];
    setHtml(
      "currency-result",
      `
        <div class="result-row"><span>${dict.converted}</span><strong>${formatNumber(converted)} ${to}</strong></div>
        <div class="result-row"><span>1 USD</span><strong>${formatNumber(EXCHANGE_RATES.USD)} AZN</strong></div>
        <div class="result-row"><span>1 EUR</span><strong>${formatNumber(EXCHANGE_RATES.EUR)} AZN</strong></div>
      `
    );
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });
  form.addEventListener("input", run);
  run();
}

function bindCompareCalculator() {
  const form = document.getElementById("compare-form");
  if (!form) return;
  restoreForm(form);

  const run = () => {
    const values = [1, 2, 3].map((idx) => ({
      amount: Number(form[`c${idx}Amount`].value),
      months: Number(form[`c${idx}Months`].value),
      rate: Number(form[`c${idx}Rate`].value) / 100
    }));

    if (values.some((item) => !(item.amount > 0 && item.months > 0 && item.rate >= 0))) {
      setError("compare", dict.invalid);
      return;
    }

    setError("compare");
    saveForm(form);
    const results = values.map((item) => {
      const payment = annuityPayment(item.amount, item.rate / 12, item.months);
      const total = payment * item.months;
      return {
        payment,
        total,
        overpayment: total - item.amount
      };
    });

    const row = (label, formatter) => `
      <div class="compare-row">
        <div><strong>${label}</strong></div>
        <div>${formatter(results[0])}</div>
        <div>${formatter(results[1])}</div>
        <div>${formatter(results[2])}</div>
      </div>
    `;

    setHtml(
      "compare-result",
      `
        <div class="compare-row">
          <div><strong>${dict.compareMetric}</strong></div>
          <div><strong>1</strong></div>
          <div><strong>2</strong></div>
          <div><strong>3</strong></div>
        </div>
        ${row(dict.monthlyPayment, (item) => formatMoney(item.payment))}
        ${row(dict.totalPayment, (item) => formatMoney(item.total))}
        ${row(dict.overpayment, (item) => formatMoney(item.overpayment))}
      `
    );
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });
  form.addEventListener("input", run);
  run();
}

function bindPopularCalculations() {
  const buttons = document.querySelectorAll("[data-popular]");
  const form = document.getElementById("loan-form");
  if (!buttons.length || !form) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      form.amount.value = button.dataset.amount;
      form.months.value = button.dataset.months;
      form.rate.value = button.dataset.rate;
      form.dispatchEvent(new Event("input", { bubbles: true }));
      document.getElementById("loan")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindSharing() {
  const copyButton = document.getElementById("copy-result");
  const shareButton = document.getElementById("share-result");
  const feedback = document.getElementById("share-feedback");
  if (!copyButton || !shareButton || !feedback) return;

  const setFeedback = (text) => {
    feedback.textContent = text;
    window.setTimeout(() => {
      feedback.textContent = "";
    }, 2200);
  };

  copyButton.addEventListener("click", async () => {
    if (!state.shareText) {
      setFeedback(dict.shareEmpty);
      return;
    }
    await navigator.clipboard.writeText(state.shareText);
    setFeedback(dict.shareReady);
  });

  shareButton.addEventListener("click", async () => {
    if (!state.shareText) {
      setFeedback(dict.shareEmpty);
      return;
    }
    if (navigator.share) {
      await navigator.share({ text: state.shareText, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(`${state.shareText} | ${window.location.href}`);
    setFeedback(dict.shareReady);
  });
}

function setYear() {
  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  bindLoanCalculator();
  bindDebtCalculator();
  bindEarlyRepayment();
  bindCurrencyConverter();
  bindCompareCalculator();
  bindPopularCalculations();
  bindSharing();
  setYear();
});
