import { prisma } from "~/server/db";

const RULES: { keywords: string[]; categoryName: string }[] = [
  { keywords: ["grab", "gojek", "uber", "be", "di chuyen", "taxi", "xe om"], categoryName: "Di chuyển" },
  { keywords: ["shopee", "lazada", "tiki", "sendo", "mua sam", "shopping"], categoryName: "Mua sắm" },
  { keywords: ["an", "food", "foody", "grab food", "highlands", "starbucks", "coffee", "nha hang", "quan an", "com", "pho"], categoryName: "Ăn uống" },
  { keywords: ["electric", "dien", "evn", "nuoc", "water", "internet", "fpt", "vnpt", "mobifone", "viettel"], categoryName: "Tiện ích" },
  { keywords: ["fitness", "gym", "yoga", "suc khoe", "phong kham", "benh vien", "hospital"], categoryName: "Sức khỏe" },
  { keywords: ["netflix", "spotify", "game", "entertainment", "giai tri"], categoryName: "Giải trí" },
  { keywords: ["petrol", "xang", "dau", "vietnam oil", "pv oil"], categoryName: "Xăng dầu" },
  { keywords: ["school", "hoc phi", "education", "university"], categoryName: "Giáo dục" },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function descriptionMatches(description: string, keywords: string[]): boolean {
  const normalized = normalize(description);
  return keywords.some((k) => normalized.includes(normalize(k)));
}

export async function suggestCategory(
  description: string,
  cardId: string,
): Promise<string | null> {
  const categories = await prisma.category.findMany({
    where: { cardId },
    select: { id: true, name: true },
  });

  const nameToId = new Map(categories.map((c) => [c.name, c.id]));

  for (const rule of RULES) {
    if (descriptionMatches(description, rule.keywords)) {
      const id = nameToId.get(rule.categoryName);
      if (id) return id;
    }
  }

  return null;
}
