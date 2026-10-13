import { Banknote, ChefHat, ChevronRight, CircleCheck, Clock3, Flame, LayoutGrid, Minus, Plus, ReceiptText, Search, ShoppingBag, Users, X } from "lucide-react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { menuItems } from "./menu"
import { formatMoney as money, listComandas, openTable, payTable, readComanda, selectionText, submitOrder, totalOf, updateOrder, type CartItem, type Comanda, type Order, type Payment } from "./local-store"
import "./operation.css"

const ModalError = createContext("")
type Role = "atendimento" | "cozinha" | "caixa"
const roleNames = { atendimento: "Garçom / Atendente", cozinha: "Cozinha", caixa: "Caixa" }
const statuses = { received: "Novo", preparing: "Em preparo", ready: "Pronto", delivered: "Entregue", cancelled: "Cancelado" }
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  const error = useContext(ModalError)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    ref.current?.showModal()
    return () => previous?.focus()
  }, [])
  return <dialog ref={ref} className="op-dialog" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close() }}><div className="op-modal-heading"><h2>{title}</h2><button className="op-icon" onClick={close} aria-label="Fechar painel"><X size={20}/></button></div>{error && <p className="op-error" role="alert">{error}</p>}{children}</dialog>
}
export default function Operation() {
  useEffect(() => { document.title = "BRASA 47 • Cozinha" }, [])
  const [role] = useState<Role>("cozinha")
  const [tabs, setTabs] = useState<Comanda[]>([])
  const [filter, setFilter] = useState("Todas")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [staffOrder, setStaffOrder] = useState<string | null>(null)
  const [openNumber, setOpenNumber] = useState<string | null>(null)
  const [pay, setPay] = useState<string | null>(null)
  const [method, setMethod] = useState<Payment["method"]>("Pix")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [tick, setTick] = useState(Date.now())
  function refresh() { try { setTabs(listComandas()) } catch { setError("Não foi possível ler os dados deste navegador.") } }
  useEffect(() => {
    refresh()
    window.addEventListener("storage", refresh); window.addEventListener("brasa:change", refresh)
    const timer = setInterval(() => setTick(Date.now()), 30000)
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("brasa:change", refresh); clearInterval(timer) }
  }, [])
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(timer) } }, [notice])
  function run(action: () => void) { try { setError(""); action(); refresh() } catch(error) { setError(error instanceof Error ? error.message : "Não foi possível concluir a ação.") } }
  const active = tabs.filter(tab => tab.status !== "closed")
  const jobs = active.flatMap(tab => tab.orders.filter(order => !["delivered", "cancelled"].includes(order.status || "received")).map(order => ({ tab, order })))
  const ready = jobs.filter(job => job.order.status === "ready")
  const bills = active.filter(tab => tab.billRequested)
  const receipts = tabs.flatMap(tab => [...(tab.history ?? []).map(history => ({ table: tab.table, payment: history.payment })), ...(tab.payment ? [{ table: tab.table, payment: tab.payment }] : [])]).filter(row => row.payment.paidAt.slice(0,10) === new Date().toISOString().slice(0,10)).sort((a,b) => b.payment.paidAt.localeCompare(a.payment.paidAt))
  const numbers = [...new Set([...Array.from({length:12},(_,index) => String(index+1)), ...tabs.map(tab => tab.table)])].sort((a,b) => a.localeCompare(b,"pt-BR",{numeric:true}))
  const selectedTab = tabs.find(tab => tab.table === selected)
  const paymentTab = tabs.find(tab => tab.table === pay)
  const staffTab = tabs.find(tab => tab.table === staffOrder)
  const stats = role === "cozinha" ? [{ label:"Novos pedidos", value:jobs.filter(job => !job.order.status || job.order.status === "received").length },{ label:"Em preparo",value:jobs.filter(job => job.order.status === "preparing").length },{ label:"Prontos",value:ready.length }] : role === "caixa" ? [{label:"Contas solicitadas",value:bills.length},{label:"Em aberto",value:money(active.reduce((sum,tab) => sum + totalOf(tab),0))},{label:"Recebido hoje",value:money(receipts.reduce((sum,row) => sum + row.payment.amount,0))}] : [{label:"Mesas ocupadas",value:active.length},{label:"Para entregar",value:ready.length},{label:"Pedindo conta",value:bills.length}]
  function elapsed(order: Order) { return Math.max(0,Math.floor((tick - new Date(order.createdAt).getTime()) / 60000)) }
  function orderCard(tab: Comanda, order: Order) {
    const status = order.status || "received"
    return <article className={`kitchen-ticket ${status}`} key={tab.sessionId + order.id}><div className="ticket-top"><span>MESA <strong>{tab.table}</strong></span><span className="ticket-time"><Clock3 size={13}/>{elapsed(order)} min</span></div><div className="ticket-label"><strong>Pedido #{order.id}</strong><span className={`op-status ${status}`}>{statuses[status]}</span></div><div className="ticket-items">{order.items.map((row,index) => <div key={index}><strong>{row.quantity}×</strong><div><h4>{row.item.name}</h4>{selectionText(row) && <p>{selectionText(row)}</p>}{row.note && <p className="prep-note">{row.note}</p>}</div></div>)}</div><button className="op-primary op-wide" onClick={() => run(() => { updateOrder(tab.table, order.id, role === "atendimento" ? "delivered" : status === "received" ? "preparing" : "ready"); setNotice(role === "atendimento" ? "Entrega registrada" : status === "received" ? "Preparo iniciado" : "Pedido pronto para entrega") })}>{role === "atendimento" ? "Confirmar entrega" : status === "received" ? "Iniciar preparo" : "Marcar como pronto"}<ChevronRight size={16}/></button></article>
  }
  return <ModalError.Provider value={error}><div className="operation-app">
    <aside className="op-sidebar"><div className="op-brand"><span><Flame size={23} fill="currentColor"/></span><strong>BRASA <em>47</em></strong></div><span className="op-sidebar-label">OPERAÇÃO</span><nav aria-label="Módulos da operação">{(["atendimento","cozinha","caixa"] as Role[]).map(item => <a key={item} className={role === item ? "active" : ""} aria-current={role === item ? "page" : undefined} href={"/restaurante-" + item + "/"}>{item === "atendimento" ? <Users size={19}/> : item === "cozinha" ? <ChefHat size={19}/> : <Banknote size={19}/>}<span>{roleNames[item]}</span></a>)}</nav><div className="op-sidebar-bottom"><span className="op-demo-dot"/> Demonstração local<p>Os módulos compartilham dados neste navegador.</p></div></aside>
    <div className="op-workspace"><header className="op-header"><div><span className="eyebrow">BRASA 47 / OPERAÇÃO</span><h1>{roleNames[role]}</h1></div><span className="op-local"><span className="op-demo-dot"/>Modo local</span></header>
      <div className="op-content"><div className="op-intro"><div><h2>{role === "cozinha" ? "Cada pedido no seu tempo." : role === "caixa" ? "Contas e recebimentos" : "Salão sob controle"}</h2><p>{role === "cozinha" ? "Confira as observações antes de iniciar o preparo." : role === "caixa" ? "Confira as entregas, registre o pagamento e encerre a comanda." : "Acompanhe mesas, lance pedidos e organize as entregas."}</p></div></div>
        <div className="op-stats">{stats.map((stat,index) => <div key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong>{index === 0 ? <ReceiptText size={21}/> : index === 1 ? <Clock3 size={21}/> : <CircleCheck size={21}/>}</div>)}</div>
        {error && !selected && !pay && !staffOrder && !openNumber && <div className="op-error" role="alert">{error}<button aria-label="Dispensar erro" onClick={() => setError("")}><X size={16}/></button></div>}
        {notice && <div className="op-notice" role="status">{notice}</div>}
        <>
          <div className="op-section-heading"><h3>Fila de produção</h3><span>{jobs.filter(job => job.order.status !== "ready").length} pedidos</span></div>
          <div className="kitchen-board">{(["received","preparing","ready"] as const).map(status => <section className="kitchen-column" key={status}><h3><span className={`stage-dot ${status}`}/>{statuses[status]} <span>{jobs.filter(job => (job.order.status || "received") === status).length}</span></h3>{jobs.filter(job => (job.order.status || "received") === status).map(({tab,order}) => status === "ready" ? <article className="ready-ticket" key={tab.sessionId+order.id}><CircleCheck size={20}/><div><strong>Mesa {tab.table} · Pedido #{order.id}</strong><p>Aguardando entrega pelo atendente</p></div></article> : orderCard(tab,order))}{!jobs.some(job => (job.order.status || "received") === status) && <div className="op-column-empty">Nenhum pedido nesta etapa</div>}</section>)}</div>
        </>
        <p className="op-footnote">Protótipo local: dados compartilhados entre abas deste navegador. Sem autenticação, cobrança real ou sincronização entre aparelhos.</p>
      </div>
    </div>
    {openNumber && <Modal title={`Abrir mesa ${openNumber}`} close={() => setOpenNumber(null)}><div className="op-modal-body"><p className="op-modal-copy">Inicie uma nova comanda para esta mesa. Os recebimentos anteriores ficam no histórico do caixa.</p><button className="op-primary op-wide" onClick={() => run(() => { openTable(openNumber); setSelected(openNumber); setOpenNumber(null); setNotice("Mesa aberta") })}>Abrir comanda <Plus size={17}/></button></div></Modal>}
    {selectedTab && <Modal title={`Comanda • Mesa ${selectedTab.table}`} close={() => setSelected(null)}><div className="op-modal-body"><div className="op-tab-summary"><span>{selectedTab.billRequested ? "Conta solicitada" : "Comanda aberta"}</span><strong>{money(totalOf(selectedTab))}</strong></div>{selectedTab.orders.map(order => <section className="op-order-detail" key={order.id}><div><h3>Pedido #{order.id}</h3><span className={`op-status ${order.status || "received"}`}>{statuses[order.status || "received"]}</span></div>{order.items.map((row,index) => <div className="op-detail-row" key={index}><div><strong>{row.quantity}× {row.item.name}</strong>{selectionText(row) && <p>{selectionText(row)}</p>}{row.note && <p className="prep-note">{row.note}</p>}</div><span>{money(row.quantity*row.unitPrice)}</span></div>)}</section>)}{!selectedTab.orders.length && <p className="op-empty">Ainda não há pedidos nesta mesa.</p>}
      {role === "atendimento" ? <button className="op-primary op-wide" disabled={selectedTab.status !== "open"} onClick={() => { setStaffOrder(selectedTab.table); setSelected(null) }}>Lançar pedido <Plus size={18}/></button> : <button className="op-primary op-wide" disabled={!selectedTab.orders.length || selectedTab.orders.some(order => !["delivered","cancelled"].includes(order.status || "received"))} onClick={() => { setPay(selectedTab.table); setSelected(null) }}>Registrar pagamento <Banknote size={18}/></button>}
      {role === "caixa" && selectedTab.orders.some(order => !["delivered","cancelled"].includes(order.status || "received")) && <p className="op-modal-copy">Aguarde a entrega dos pedidos antes de encerrar a comanda.</p>}
      <a className="op-client-link" target="_blank" rel="noreferrer" href={`/restaurante/?mesa=${encodeURIComponent(selectedTab.table)}`}>Abrir cardápio desta mesa <ChevronRight size={16}/></a>
    </div></Modal>}

    {paymentTab && <Modal title={`Pagamento • Mesa ${paymentTab.table}`} close={() => setPay(null)}><div className="op-modal-body"><div className="op-payment-total"><span>Total a receber</span><strong>{money(totalOf(paymentTab))}</strong></div><fieldset className="op-payment-method"><legend>Forma de pagamento</legend>{(["Pix","Cartão","Dinheiro"] as const).map(item => <label key={item}><input type="radio" name="payment" value={item} checked={method===item} onChange={() => setMethod(item)}/>{item}</label>)}</fieldset><p className="op-modal-copy">Este registro é local. Confirme somente depois de receber o pagamento. A mesa será liberada e a comanda encerrada.</p><button className="op-primary op-wide" onClick={() => run(() => { payTable(paymentTab.table,method,totalOf(paymentTab));setPay(null);setNotice("Pagamento registrado. Mesa liberada.") })}>Confirmar recebimento <CircleCheck size={17}/></button></div></Modal>}
  </div></ModalError.Provider>
}
