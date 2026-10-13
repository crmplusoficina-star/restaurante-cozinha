type CategoryId = "featured" | "smash" | "combos" | "sides" | "drinks"

type MenuOption = {
  id: string
  label: string
  price: number
}

type OptionGroup = {
  id: string
  label: string
  required?: boolean
  multiple?: boolean
  defaultOptionId?: string
  options: MenuOption[]
}

export type MenuItem = {
  id: string
  category: Exclude<CategoryId, "featured">
  name: string
  shortDescription: string
  details: string
  ingredients?: string[]
  allergens?: string[]
  allergenInfoConfirmed?: boolean
  price: number
  image: string
  imageAlt: string
  badge?: string
  available?: boolean
  spicy?: boolean
  optionGroups?: OptionGroup[]
}

export const categories: { id: CategoryId; label: string }[] = [
  { id: "featured", label: "Destaques" },
  { id: "smash", label: "Smash burgers" },
  { id: "combos", label: "Combos" },
  { id: "sides", label: "Porções" },
  { id: "drinks", label: "Bebidas" },
]

export const menuItems: MenuItem[] = [
  {
    id: "brasa-smash",
    category: "smash",
    name: "Brasa Smash",
    shortDescription: "Carne, queijo e molho da casa em pão brioche.",
    details:
      "Carne prensada na chapa, queijo derretido, cebola roxa e molho BRASA em pão brioche com toque de alho e mostarda.",
    price: 2690,
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Hambúrguer artesanal com queijo e molho",
    badge: "Mais pedido",
    available: true,
  },
  {
    id: "duplo-47",
    category: "smash",
    name: "Duplo 47",
    shortDescription: "Duas carnes e picles agridoce em sabor intenso.",
    details:
      "Dois smash no pão brioche, queijo, picles e molho defumado com acidez equilibrada para um sabor urbano e direto.",
    price: 3590,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Duplo hambúrguer com queijo e picles",
    badge: "Novo",
    available: true,
  },
  {
    id: "bacon-na-chapa",
    category: "smash",
    name: "Bacon na Chapa",
    shortDescription: "Bacon crocante, cheddar e cebola caramelizada.",
    details:
      "Smash com bacon dourado na chapa, cheddar cremoso e cebola caramelizada para um sabor mais encorpado e com crosta.",
    price: 3190,
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Cheeseburger com bacon e cebola caramelizada",
    badge: "Bruto",
    available: true,
  },
  {
    id: "veggie-de-rua",
    category: "smash",
    name: "Veggie de Rua",
    shortDescription: "Burger vegetal com rúcula e maionese verde.",
    details:
      "Burger de cogumelos e grão de bico com queijo, rúcula, tomate e maionese de ervas para quem quer um smash sem carne.",
    price: 2890,
    image:
      "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Hambúrguer vegetariano com folhas e tomate",
    badge: "Esgotado",
    available: false,
  },
  {
    id: "combo-duplo",
    category: "combos",
    name: "Combo Duplo + fritas",
    shortDescription: "Duplo 47 com fritas e bebida gelada.",
    details:
      "Duplo 47 com fritas da casa e bebida na escolha. A melhor combinação para fome de rua com ritmo de almoço.",
    price: 4890,
    image:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Combo de hambúrguer com fritas e bebida",
    badge: "Economize",
    available: true,
    optionGroups: [
      {
        id: "drink",
        label: "Escolha a bebida",
        required: true,
        defaultOptionId: "cola",
        options: [
          { id: "cola", label: "Cola 350 ml", price: 0 },
          { id: "mate", label: "Mate com limão", price: 200 },
          { id: "water", label: "Água com gás", price: 0 },
        ],
      },
    ],
  },
  {
    id: "combo-brasa",
    category: "combos",
    name: "Combo Brasa",
    shortDescription: "Brasa Smash, fritas e bebida gelada.",
    details:
      "O clássico BRASA com smash, fritas crocantes e bebida na escolha. Direto, equilibrado e por uma boa razão.",
    price: 3990,
    image:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Combo de hambúrguer com fritas numa mesa",
    available: true,
    optionGroups: [
      {
        id: "drink",
        label: "Escolha a bebida",
        required: true,
        defaultOptionId: "cola",
        options: [
          { id: "cola", label: "Cola 350 ml", price: 0 },
          { id: "mate", label: "Mate com limão", price: 200 },
          { id: "water", label: "Água com gás", price: 0 },
        ],
      },
    ],
  },
  {
    id: "fritas-da-casa",
    category: "sides",
    name: "Fritas da Casa",
    shortDescription: "Fritas crocantes com sal de páprica.",
    details:
      "Porção generosa de fritas douradas e crocantes, finalizadas com sal de páprica e maionese de alho.",
    price: 1690,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Porção de batatas fritas douradas",
    badge: "Para dividir",
    available: true,
  },
  {
    id: "onion-rings",
    category: "sides",
    name: "Onion Rings Picantes",
    shortDescription: "Anéis de cebola crocantes e quentes.",
    details:
      "Anéis de cebola empanados, crocantes por fora e em textura macia por dentro, com tempero quente da casa.",
    price: 1890,
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Porção de anéis de cebola empanados",
    badge: "Picante",
    spicy: true,
    available: true,
  },
  {
    id: "mate-limon",
    category: "drinks",
    name: "Mate com Limão",
    shortDescription: "Cítrico e refrescante para acompanhar os smash.",
    details:
      "Mate gelado com limão espremido, pouca doçura e acidez equilibrada para um fechamento leve.",
    price: 900,
    image:
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Copo de bebida gelada com limão",
    available: true,
    optionGroups: [
      {
        id: "size",
        label: "Tamanho",
        required: true,
        defaultOptionId: "medium",
        options: [
          { id: "medium", label: "300 ml", price: 0 },
          { id: "large", label: "500 ml + R$ 2,00", price: 200 },
        ],
      },
    ],
  },
  {
    id: "cola",
    category: "drinks",
    name: "Cola",
    shortDescription: "Refrigerante clássico gelado.",
    details:
      "Lata 350 ml, bem gelada e pronta para combinar com a crosta dos smash e o sal das fritas.",
    price: 700,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f2aef2f3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Lata de refrigerante gelada",
    available: true,
  },
  {
    id: "agua-com-gas",
    category: "drinks",
    name: "Água com Gás",
    shortDescription: "Gelada e leve para o momento de rua.",
    details:
      "Água mineral com gás, garrafa 500 ml, servida gelada para refrescar sem perder a sequência do pedido.",
    price: 600,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Garrafa de água com gás",
    available: true,
  },
]

