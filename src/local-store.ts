import type { MenuItem } from "./menu"

export type CartItem = { key: string; item: MenuItem; selections: Record<string, string[]>; note: string; quantity: number; unitPrice: number }
export type OrderStatus = "received" | "preparing" | "ready" | "delivered" | "cancelled"
export type Order = { id: number; table: string; items: CartItem[]; createdAt: string; status?: OrderStatus }
export type Payment = { id: string; amount: number; method: "Pix" | "Cartão" | "Dinheiro"; paidAt: string }
export type History = { sessionId: string; orders: Order[]; payment: Payment }
export type Comanda = { table: string; sessionId: string; status: "open" | "bill_requested" | "closed"; billRequested: boolean; orders: Order[]; payment?: Payment; history?: History[] }
export const table = new URLSearchParams(location.search).get("mesa")?.trim().slice(0, 40) || "1"
const prefix = "brasa47:draft:comanda:v1:"
export const formatMoney = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n / 100)
export function totalOf(comanda: Comanda) { return comanda.orders.filter(order => order.status !== "cancelled").reduce((sum, order) => sum + order.items.reduce((total, row) => total + row.unitPrice * row.quantity, 0), 0) }
export function readComanda(number = table): Comanda {
  const empty: Comanda = { table: number, sessionId: "draft-" + number, status: "open", billRequested: false, orders: [] }
  try {
    const saved = JSON.parse(localStorage.getItem(prefix + number) || "null")
    if (saved && saved.table === number && typeof saved.sessionId === "string" &&
      ["open", "bill_requested", "closed"].includes(saved.status) && Array.isArray(saved.orders) &&
      saved.orders.every((order: Order) => Number.isFinite(order.id) && Array.isArray(order.items) &&
        order.items.every(row => row.item && typeof row.item.name === "string" && Number.isFinite(row.unitPrice) &&
          row.unitPrice >= 0 && Number.isInteger(row.quantity) && row.quantity > 0))) return saved
  } catch { /* Invalid local data does not enter the operation. */ }
  return empty
}
export function saveComanda(next: Comanda) {
  localStorage.setItem(prefix + next.table, JSON.stringify(next))
  window.dispatchEvent(new Event("brasa:change"))
}
export function listComandas(): Comanda[] {
  const numbers = new Set<string>()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(prefix)) numbers.add(key.slice(prefix.length))
  }
  return [...numbers].map(number => readComanda(number)).sort((a,b) => a.table.localeCompare(b.table, "pt-BR", { numeric: true }))
}
export function openTable(number: string) {
  const current = listComandas().find(tab => tab.table === number)
  if (current && current.status !== "closed") throw new Error("Esta mesa já está aberta.")
  const history = [...(current?.history ?? [])]
  if (current?.payment) history.push({ sessionId: current.sessionId, orders: current.orders, payment: current.payment })
  const next: Comanda = { table: number, sessionId: "draft-" + number + "-" + crypto.randomUUID(), status: "open", billRequested: false, orders: [], history }
  saveComanda(next)
}
export function submitOrder(number: string, items: CartItem[], expectedSession?: string) {
  const current = readComanda(number)
  if (expectedSession && expectedSession !== current.sessionId) throw new Error("A sessão da mesa mudou. Abra o pedido novamente.")
  if (current.status !== "open") throw new Error("Esta mesa não aceita novos pedidos.")
  if (!items.length) throw new Error("Adicione pelo menos um item.")
  const id = Math.max(0, ...current.orders.map(order => order.id)) + 1
  const next = { ...current, orders: [...current.orders, { id, table: number, items, createdAt: new Date().toISOString(), status: "received" as const }] }
  saveComanda(next)
  return { next, id }
}
export function updateOrder(number: string, id: number, status: OrderStatus) {
  const current = readComanda(number)
  if (current.status === "closed") throw new Error("A comanda está encerrada.")
  const order = current.orders.find(order => order.id === id)
  if (!order) throw new Error("Pedido não encontrado.")
  const allowed: Record<string, OrderStatus[]> = { received: ["preparing"], preparing: ["ready"], ready: ["delivered"] }
  if (!allowed[order.status || "received"]?.includes(status)) throw new Error("O pedido já mudou de etapa. Atualize a tela.")
  saveComanda({ ...current, orders: current.orders.map(order => order.id === id ? { ...order, status } : order) })
}
export function payTable(number: string, method: Payment["method"], expectedTotal: number) {
  const current = readComanda(number)
  if (current.status === "closed") throw new Error("Esta comanda já foi encerrada.")
  if (!current.orders.length || !totalOf(current)) throw new Error("A comanda está vazia.")
  if (current.orders.some(order => !["delivered", "cancelled"].includes(order.status || "received"))) throw new Error("Existem pedidos pendentes de entrega.")
  if (expectedTotal !== totalOf(current)) throw new Error("A comanda mudou. Confira o novo total.")
  saveComanda({ ...current, status: "closed", billRequested: false, payment: { id: crypto.randomUUID(), amount: totalOf(current), method, paidAt: new Date().toISOString() } })
}
export function selectionText(row: CartItem) {
  return row.item.optionGroups?.flatMap(group => (row.selections[group.id] ?? []).map(id => group.options.find(option => option.id === id)?.label)).filter(Boolean).join(" • ")
}
