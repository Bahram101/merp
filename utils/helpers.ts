export function getSurnameAndName(fullName: string | undefined): string {
  if (!fullName) return "";
  const parts = fullName.split(" ").filter(Boolean);
  const [surname, name] = [parts[0] ?? "", parts[1] ?? ""];
  return `${surname} ${name}`.trim();
}

export const formatMoney = (value: number): string => {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₸";
};

export const formatCurrency = (value: number, symbol: string = "₸"): string => {
  if (value == null || isNaN(value)) return `0 ${symbol}`;

  return value.toLocaleString("ru-RU") + ` ${symbol}`;
};

export const formatNumber = (value: string) => {
  if (!value) return "";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const tenge = String.fromCharCode(0x20b8);

export const strToLowerCase = (str: string | undefined): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatFullName = (str: string): string => {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
};

const PHONE_OPERATOR_CODE_LENGTH = 3;
const PHONE_VISIBLE_TAIL_LENGTH = 4;

// Kazakhstani mobile numbers: 10 digits (operator code + subscriber number),
// optionally prefixed with a country/trunk code ("+7" or domestic "8").
export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  let digits = phone.trim().replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    digits = digits.slice(1);
  }

  const maskedLength =
    digits.length - PHONE_OPERATOR_CODE_LENGTH - PHONE_VISIBLE_TAIL_LENGTH;
  if (digits.length !== 10 || maskedLength <= 0) return phone;

  const operatorCode = digits.slice(0, PHONE_OPERATOR_CODE_LENGTH);
  const tail = digits.slice(-PHONE_VISIBLE_TAIL_LENGTH);

  return `+7 ${operatorCode} ${"*".repeat(maskedLength)} ${tail}`;
};
