import { useState } from "react";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Accordion, AccordionItem } from "../components/ui/Accordion";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { EmptyState } from "../components/ui/EmptyState";
import { Select } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { Skeleton, SkeletonText } from "../components/ui/Skeleton";
import { StatCard } from "../components/ui/StatCard";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "../components/ui/Table";
import { Textarea } from "../components/ui/Textarea";
import { useToast } from "../components/ui/Toast";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../components/ui/Modal";
import { Tabs, TabList, Tab, TabPanel } from "../components/ui/Tabs";
import { DataList, DataListRow } from "../components/ui/DataList";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { Pagination } from "../components/ui/Pagination";
import { RadioGroup, RadioItem } from "../components/ui/RadioGroup";
import { Divider } from "../components/ui/Divider";
import { ChartContainer } from "../components/ui/ChartContainer";
import { Stepper } from "../components/ui/Stepper";
import { Avatar } from "../components/ui/Avatar";
import { Switch } from "../components/ui/Switch";
import { Tooltip } from "../components/ui/Tooltip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export default function DesignSystem() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [modalSm, setModalSm] = useState(false);
  const [modalMd, setModalMd] = useState(false);
  const [modalLg, setModalLg] = useState(false);
  const [controlledTab, setControlledTab] = useState("overview");
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [suitability, setSuitability] = useState("qualificado");
  const [timeframe, setTimeframe] = useState("12m");
  const [stepperStep, setStepperStep] = useState(2);
  const [sw1, setSw1] = useState(false);
  const [sw2, setSw2] = useState(true);

  const performanceData = [
    { month: "Jun/25", cota: 100.0 },
    { month: "Jul/25", cota: 100.84 },
    { month: "Ago/25", cota: 101.43 },
    { month: "Set/25", cota: 102.71 },
    { month: "Out/25", cota: 103.55 },
    { month: "Nov/25", cota: 104.82 },
    { month: "Dez/25", cota: 105.34 },
    { month: "Jan/26", cota: 106.71 },
    { month: "Fev/26", cota: 107.43 },
    { month: "Mar/26", cota: 109.01 },
    { month: "Abr/26", cota: 110.22 },
    { month: "Mai/26", cota: 111.23 },
  ];

  const colors = [
    { name: "Yvy Navy (Primary)", hex: "#122C4F", rgb: "rgb(18 44 79)", usage: "Banners, primary backgrounds, header, solid buttons" },
    { name: "Yvy Royal Blue (Accent)", hex: "#3E5FAA", rgb: "rgb(62 95 170)", usage: "Active states, hover accents, links, chevron highlights" },
    { name: "Yvy Pure Black", hex: "#000000", rgb: "rgb(0 0 0)", usage: "Headers, footers, dark sub-backgrounds" },
    { name: "Yvy Pure White", hex: "#FFFFFF", rgb: "rgb(255 255 255)", usage: "Primary canvas background, banner texts" },
  ];

  const sampleInvestors = [
    { nome: "João Mendes Silva", cpf: "•••.456.789-••", tipo: "Qualificado", status: "Aprovado", cotas: "1.200", aporte: "R$ 600.000" },
    { nome: "Maria Cristina Alves", cpf: "•••.123.456-••", tipo: "Profissional", status: "Aprovado", cotas: "2.500", aporte: "R$ 1.250.000" },
    { nome: "Pedro Augusto Costa", cpf: "•••.789.012-••", tipo: "Qualificado", status: "Pendente", cotas: "800", aporte: "R$ 400.000" },
    { nome: "Ana Lima Ferreira", cpf: "•••.321.654-••", tipo: "Varejo", status: "Reprovado", cotas: "—", aporte: "—" },
  ];

  const statusVariant = (s: string) =>
    s === "Aprovado" ? "success" : s === "Pendente" ? "warning" : "danger";

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-yvy-navy font-barlow pb-24">
      {/* Header Banner */}
      <header className="bg-yvy-navy text-white py-16 px-6 relative overflow-hidden border-b border-black/25">
        <div className="max-w-[1366px] mx-auto flex flex-col md:flex-row justify-between items-center gap-y-8">
          <div className="flex flex-col gap-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-light font-barlowcn uppercase tracking-widest leading-none">
              YVY Capital
            </h1>
            <p className="text-xl font-light font-barlow tracking-wider opacity-85">
              Digital Platform Design System Foundations
            </p>
            <div className="inline-flex items-center gap-x-2 text-xs uppercase font-barlowcn tracking-widest bg-white/10 px-3 py-1.5 self-center md:self-start">
              <span>Stack: React + Vite + TS + Tailwind v4</span>
            </div>
          </div>
          <div className="bg-white/5 p-8 border border-white/10 rounded backdrop-blur-sm">
            <Logo width={220} height={118} fillColor="#ffffff" />
          </div>
        </div>
      </header>

      <main className="max-w-[1366px] mx-auto px-6 mt-16 flex flex-col gap-y-20">

        {/* Section 1: Colors */}
        <section id="colors" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            01. Brand Colors
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            The Yvy Capital palette is grounded in a deep, elegant Navy blue representing asset security and prestige, complemented by a vibrant Royal Blue accent for interaction and state shifts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {colors.map((c) => (
              <Card key={c.hex} className="hover:border-yvy-royal group relative overflow-hidden">
                <div
                  className="h-32 w-full border border-black/10 transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: c.hex }}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">{c.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-gray-500">HEX: {c.hex}</span>
                    <button
                      onClick={() => handleCopy(c.hex)}
                      className="text-yvy-royal font-barlowcn hover:underline cursor-pointer"
                    >
                      {copiedColor === c.hex ? "COPIED!" : "COPY"}
                    </button>
                  </div>
                  <div className="font-mono text-gray-500">RGB: {c.rgb}</div>
                  <div className="mt-2 text-yvy-navy font-light leading-snug">{c.usage}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Typography */}
        <section id="typography" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            02. Typography Hierarchy
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card>
              <CardHeader>
                <CardTitle>Display & Headers (Barlow Condensed)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-6">
                <div>
                  <span className="text-xs font-mono text-gray-400 block mb-1">Display (uppercase font-light text-5xl)</span>
                  <h1 className="text-5xl font-light font-barlowcn uppercase tracking-wider text-yvy-navy">
                    YVY CAPITAL ASSET
                  </h1>
                </div>
                <div>
                  <span className="text-xs font-mono text-gray-400 block mb-1">Heading 1 (uppercase font-semibold text-3xl)</span>
                  <h2 className="text-3xl font-semibold font-barlowcn uppercase tracking-wide text-yvy-navy">
                    POLÍTICAS DA EMPRESA
                  </h2>
                </div>
                <div>
                  <span className="text-xs font-mono text-gray-400 block mb-1">Navigation / Subtitle (uppercase tracking-widest text-lg)</span>
                  <h3 className="text-lg font-medium font-barlowcn uppercase tracking-widest text-yvy-royal">
                    INVESTIMENTOS E GESTÃO
                  </h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reading Body Text (Barlow)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-6 text-sm">
                <div>
                  <span className="text-xs font-mono text-gray-400 block mb-1">Paragraph Lead (text-lg font-light)</span>
                  <p className="text-lg font-light leading-relaxed">
                    Yvy Capital é uma gestora de recursos independente com foco em investimentos sustentáveis de longo prazo no Brasil.
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono text-gray-400 block mb-1">Default Body (text-sm font-normal)</span>
                  <p className="text-sm font-normal leading-relaxed text-gray-700">
                    Nossa filosofia de investimentos busca alinhar retornos financeiros sólidos a práticas de governança ambiental e social de excelência.
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono text-gray-400 block mb-1">Helper / Muted Text (text-xs font-light text-gray-400)</span>
                  <p className="text-xs font-light text-gray-400 leading-relaxed">
                    * Rua Joaquim Floriano, 960 | Itaim Bibi, São Paulo - SP | CEP: 04534-004
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Buttons */}
        <section id="buttons" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            03. Button Interactivity
          </h2>
          <Card>
            <CardContent className="flex flex-wrap gap-6 items-center">
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Solid Primary</span>
                <Button variant="solid">Acessar Canal</Button>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Outline Variant</span>
                <Button variant="outline">Download PDF</Button>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Ghost Clean</span>
                <Button variant="ghost">Ver Mais</Button>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Small Sizing</span>
                <Button size="sm">Fale Conosco</Button>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Large Sizing</span>
                <Button size="lg" variant="solid">Começar Agora</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Form Fields */}
        <section id="forms" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            04. Inputs & Forms
          </h2>
          <Card className="max-w-xl">
            <CardContent className="flex flex-col gap-y-6">
              <div className="flex flex-col">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" placeholder="Digite seu nome..." />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="email">E-mail Corporativo</Label>
                <Input id="email" type="email" placeholder="ir@yvy.capital.com.br" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="disabled">Identificador CVM (Desabilitado)</Label>
                <Input id="disabled" disabled value="CVM 175 - REGULAMENTO ATIVO" />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="observacoes">Observações (Textarea)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Adicione observações sobre o investidor ou operação..."
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="regulamento">Campo fixo sem resize</Label>
                <Textarea
                  id="regulamento"
                  rows={5}
                  resize="none"
                  defaultValue="YVYQ11 — Fundo de Infraestrutura. Regulamento aprovado em Assembleia de Cotistas em 15/01/2025 e registrado na CVM sob o nº 175."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Corporate Accordions */}
        <section id="accordions" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            05. Corporate Accordions (Interactive Motif)
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            A precise replica of Yvy Capital's website document system. Notice the rotating chevron vectors, the text color shifting on expand, and the minimalist dividers.
          </p>
          <div className="bg-white border border-black/15 p-6 lg:p-12">
            <Accordion>
              <AccordionItem title="Políticas da Empresa">
                <ul className="flex flex-col gap-y-4">
                  {["Contratação de Terceiros", "Gestão de Riscos", "Investimentos Pessoais", "PLDFT (Jan 25)"].map((doc) => (
                    <li key={doc} className="border-b border-black/10 pb-2.5">
                      <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-yvy-royal hover:underline flex w-full justify-between items-center text-sm">
                        <span>{doc}</span>
                        <svg width="16" height="16" viewBox="0 0 14 15" fill="none"><path d="M3.25 7.41663L6.58333 10.75L9.91667 7.41663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.58333 10.75V0.75M12.4167 11.5833V12.0833C12.4167 13.1917 11.525 14.0833 10.4167 14.0833H2.75C1.64167 14.0833 0.75 13.1917 0.75 12.0833V11.5833" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/></svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionItem>
              <AccordionItem title="YVYQ11 Fundo de Infraestrutura">
                <ul className="flex flex-col gap-y-4">
                  {["Regulamento do Fundo", "Prospecto Preliminar", "Comunicado ao Mercado"].map((doc) => (
                    <li key={doc} className="border-b border-black/10 pb-2.5">
                      <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-yvy-royal hover:underline flex w-full justify-between items-center text-sm">
                        <span>{doc}</span>
                        <svg width="16" height="16" viewBox="0 0 14 15" fill="none"><path d="M3.25 7.41663L6.58333 10.75L9.91667 7.41663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.58333 10.75V0.75M12.4167 11.5833V12.0833C12.4167 13.1917 11.525 14.0833 10.4167 14.0833H2.75C1.64167 14.0833 0.75 13.1917 0.75 12.0833V11.5833" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/></svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Section 6: Badge */}
        <section id="badges" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            06. Status Badges
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Inline status indicators for fund lifecycle, investor KYC, compliance documents, and report states.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-y-8">
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">Variants (size md)</span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="success">Aprovado</Badge>
                  <Badge variant="warning">Pendente</Badge>
                  <Badge variant="danger">Reprovado</Badge>
                  <Badge variant="neutral">Encerrado</Badge>
                  <Badge variant="info">Em Captação</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">Size sm (table cells)</span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="success" size="sm">Ativo</Badge>
                  <Badge variant="warning" size="sm">KYC Pendente</Badge>
                  <Badge variant="danger" size="sm">Vencido</Badge>
                  <Badge variant="info" size="sm">YVYQ11</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 7: Alert */}
        <section id="alerts" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            07. Contextual Alerts
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Inline persistent messages for login errors, missing documents, regulatory notices, and compliance warnings. Not toasts — these stay visible until resolved.
          </p>
          <div className="flex flex-col gap-y-4 max-w-2xl">
            <Alert variant="info" title="Período de Captação Aberto">
              O fundo YVYQ11 está em período de captação até 30/06/2026. Novas subscrições serão aceitas até as 17h do último dia.
            </Alert>
            <Alert variant="success" title="Documento Assinado">
              O regulamento do fundo foi assinado com sucesso e registrado na CVM.
            </Alert>
            <Alert variant="warning" title="Documentos Pendentes">
              O cadastro do investidor está incompleto. Anexe o comprovante de renda para prosseguir.
            </Alert>
            {!alertDismissed && (
              <Alert
                variant="error"
                title="Credenciais Inválidas"
                onDismiss={() => setAlertDismissed(true)}
              >
                E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.
              </Alert>
            )}
            {alertDismissed && (
              <div className="text-xs font-mono text-gray-400 italic">
                Alert de erro dispensado via botão ×
              </div>
            )}
          </div>
        </section>

        {/* Section 8: StatCard + Skeleton */}
        <section id="statcards" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            08. KPI StatCards & Skeletons
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Primary metric tiles for the Dashboard. The <code className="font-mono text-xs bg-black/5 px-1">loading</code> prop activates an inline skeleton shimmer — no layout shift between load and data states.
          </p>
          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/20 divide-x divide-black/20 divide-y lg:divide-y-0">
              <StatCard
                label="AUM Total"
                value="R$ 1,2B"
                delta={{ value: "+8,4%", direction: "up" }}
                caption="vs. dez/24"
              />
              <StatCard
                label="Retorno YVYQ11"
                value="+14,7%"
                delta={{ value: "CDI+4,2%", direction: "up" }}
                caption="acumulado 12M"
              />
              <StatCard
                label="Investidores"
                value="847"
                delta={{ value: "+23", direction: "up" }}
                caption="últimos 30 dias"
              />
              <StatCard
                label="Valor da Cota"
                value="R$ 111,23"
                delta={{ value: "−0,12%", direction: "down" }}
                caption="mai/26"
              />
            </div>

            <div className="flex flex-col gap-y-3">
              <span className="text-xs font-mono text-gray-400">Loading state (skeleton shimmer)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/20 divide-x divide-black/20 divide-y lg:divide-y-0">
                <StatCard label="" value="" loading />
                <StatCard label="" value="" loading />
                <StatCard label="" value="" loading />
                <StatCard label="" value="" loading />
              </div>
            </div>

            <div className="flex flex-col gap-y-3">
              <span className="text-xs font-mono text-gray-400">Skeleton primitives (Skeleton + SkeletonText)</span>
              <Card className="max-w-sm">
                <CardContent className="flex flex-col gap-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <SkeletonText lines={3} />
                  <Skeleton className="h-10 w-28" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 9: Table + EmptyState */}
        <section id="table" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            09. Data Table & Empty State
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            The primary data grid for Investidores, Fundos, and Compliance pages. Supports sortable headers, row click navigation, striped rows, and a zero-data empty state.
          </p>

          <div className="bg-white border border-black/20">
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
              <h3 className="font-barlowcn uppercase tracking-wide text-lg font-light text-yvy-navy">
                Investidores Cadastrados
              </h3>
              <Badge variant="neutral" size="sm">{sampleInvestors.length} registros</Badge>
            </div>
            <Table striped>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-10">
                    <Checkbox
                      checked={false}
                      indeterminate
                      onChange={() => {}}
                      aria-label="Selecionar todos"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell
                    sortable
                    sortDirection={sortDir}
                    onSort={() => setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc")}
                  >
                    Nome
                  </TableHeaderCell>
                  <TableHeaderCell>CPF</TableHeaderCell>
                  <TableHeaderCell>Tipo</TableHeaderCell>
                  <TableHeaderCell>Status KYC</TableHeaderCell>
                  <TableHeaderCell className="text-right">Cotas</TableHeaderCell>
                  <TableHeaderCell className="text-right">Aporte</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleInvestors.map((inv) => (
                  <TableRow key={inv.cpf} onRowClick={() => {}}>
                    <TableCell>
                      <Checkbox
                        checked={false}
                        onChange={() => {}}
                        aria-label={`Selecionar ${inv.nome}`}
                      />
                    </TableCell>
                    <TableCell className="font-normal">{inv.nome}</TableCell>
                    <TableCell className="font-mono text-xs">{inv.cpf}</TableCell>
                    <TableCell>{inv.tipo}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(inv.status)} size="sm">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{inv.cotas}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{inv.aporte}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-y-3">
            <span className="text-xs font-mono text-gray-400">EmptyState — zero data variant</span>
            <div className="bg-white border border-black/20">
              <EmptyState
                title="Nenhum investidor cadastrado"
                description="Cadastre o primeiro cotista para começar a gerenciar o fundo YVYQ11."
                action={<Button size="sm">Cadastrar Investidor</Button>}
                icon={
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="12" width="32" height="26" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 12V10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M24 22v8M20 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* Section 10: Select + Checkbox */}
        <section id="form-extensions" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            10. Form Extensions (Select & Checkbox)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Dropdown</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-5">
                <div className="flex flex-col">
                  <Label htmlFor="status-filter">Filtrar por Status</Label>
                  <Select id="status-filter" placeholder="Todos os status">
                    <option value="ativo">Ativo</option>
                    <option value="captacao">Em Captação</option>
                    <option value="encerrado">Encerrado</option>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="tipo-investidor">Tipo de Investidor</Label>
                  <Select id="tipo-investidor" defaultValue="qualificado">
                    <option value="varejo">Varejo</option>
                    <option value="qualificado">Qualificado</option>
                    <option value="profissional">Profissional</option>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="select-disabled">Campo Desabilitado</Label>
                  <Select id="select-disabled" disabled defaultValue="cvm175">
                    <option value="cvm175">CVM 175 — Regulamento Ativo</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkbox</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-5">
                <div className="flex flex-col gap-y-3">
                  <span className="text-xs font-mono text-gray-400">States</span>
                  <div className="flex flex-col gap-y-3">
                    <label className="flex items-center gap-x-3 cursor-pointer">
                      <Checkbox
                        checked={checked1}
                        onChange={(e) => setChecked1(e.target.checked)}
                      />
                      <span className="text-sm font-barlow">Unchecked → Checked (interactive)</span>
                    </label>
                    <label className="flex items-center gap-x-3 cursor-pointer">
                      <Checkbox
                        checked={checked2}
                        onChange={(e) => setChecked2(e.target.checked)}
                      />
                      <span className="text-sm font-barlow">Checked (toggle above)</span>
                    </label>
                    <label className="flex items-center gap-x-3">
                      <Checkbox indeterminate onChange={() => {}} />
                      <span className="text-sm font-barlow">Indeterminate (select-all header)</span>
                    </label>
                    <label className="flex items-center gap-x-3 opacity-50">
                      <Checkbox disabled />
                      <span className="text-sm font-barlow">Disabled</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-y-2 pt-3 border-t border-black/10">
                  <span className="text-xs font-mono text-gray-400">KYC declaration example</span>
                  <label className="flex items-start gap-x-3 cursor-pointer">
                    <Checkbox className="mt-0.5" onChange={() => {}} />
                    <span className="text-xs font-barlow font-light text-yvy-navy/70 leading-relaxed">
                      Declaro que li e aceito o Regulamento do Fundo YVYQ11 e confirmo que me enquadro como Investidor Qualificado nos termos da Instrução CVM 175.
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 11: Toast */}
        <section id="toasts" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            11. Toast Notifications
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Ephemeral feedback toasts rendered via portal into{" "}
            <code className="font-mono text-xs bg-black/5 px-1">document.body</code>.
            Stack vertically top-right (max 5). Auto-dismiss after 5s with slide animation. Click × to dismiss early.
          </p>
          <Card>
            <CardContent className="flex flex-wrap gap-4 items-center">
              <Button
                size="sm"
                onClick={() =>
                  toast({ variant: "success", title: "Salvo com sucesso", description: "As alterações foram registradas no sistema." })
                }
              >
                Success
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast({ variant: "error", title: "Erro ao salvar", description: "Verifique os campos obrigatórios e tente novamente." })
                }
              >
                Error
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast({ variant: "warning", title: "Atenção", description: "Prazo de captação se encerra hoje às 17h." })
                }
              >
                Warning
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  toast({ variant: "info", title: "Novo investidor", description: "João Silva foi cadastrado e aguarda KYC." })
                }
              >
                Info
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  toast({ variant: "info", title: "Toast sem descrição" })
                }
              >
                Só título
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Section 12: Modal */}
        <section id="modal" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            12. Modal
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Built on native{" "}
            <code className="font-mono text-xs bg-black/5 px-1">&lt;dialog&gt;</code>{" "}
            — browser-native focus trap, Escape key, and backdrop. Scroll locks while open. Click backdrop or Escape to close.
          </p>
          <Card>
            <CardContent className="flex flex-wrap gap-4 items-center">
              <Button size="sm" onClick={() => setModalSm(true)}>Abrir SM (400px)</Button>
              <Button size="sm" variant="outline" onClick={() => setModalMd(true)}>Abrir MD (560px)</Button>
              <Button size="sm" variant="ghost" onClick={() => setModalLg(true)}>Abrir LG (720px)</Button>
            </CardContent>
          </Card>

          {/* SM — Confirmation dialog */}
          <Modal open={modalSm} onClose={() => setModalSm(false)} size="sm" aria-labelledby="modal-sm-title">
            <ModalHeader onClose={() => setModalSm(false)}>
              <h2 id="modal-sm-title" className="text-lg font-semibold font-barlowcn uppercase tracking-wide text-yvy-navy">
                Confirmar Exclusão
              </h2>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm font-barlow font-light text-yvy-navy leading-relaxed">
                Tem certeza que deseja remover o investidor <strong>João Mendes Silva</strong> do fundo YVYQ11? Esta ação não pode ser desfeita.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" size="sm" onClick={() => setModalSm(false)}>Cancelar</Button>
              <Button variant="solid" size="sm" onClick={() => { setModalSm(false); toast({ variant: "success", title: "Investidor removido" }); }}>
                Confirmar
              </Button>
            </ModalFooter>
          </Modal>

          {/* MD — Form dialog */}
          <Modal open={modalMd} onClose={() => setModalMd(false)} size="md" aria-labelledby="modal-md-title">
            <ModalHeader onClose={() => setModalMd(false)}>
              <h2 id="modal-md-title" className="text-lg font-semibold font-barlowcn uppercase tracking-wide text-yvy-navy">
                Editar Investidor
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-y-5">
                <div className="flex flex-col">
                  <Label htmlFor="modal-nome">Nome Completo</Label>
                  <Input id="modal-nome" defaultValue="João Mendes Silva" />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="modal-email">E-mail</Label>
                  <Input id="modal-email" type="email" defaultValue="joao.silva@email.com" />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="modal-tipo">Tipo de Investidor</Label>
                  <Select id="modal-tipo" defaultValue="qualificado">
                    <option value="varejo">Varejo</option>
                    <option value="qualificado">Qualificado</option>
                    <option value="profissional">Profissional</option>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="modal-obs">Observações</Label>
                  <Textarea id="modal-obs" rows={3} placeholder="Observações internas..." />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" size="sm" onClick={() => setModalMd(false)}>Cancelar</Button>
              <Button variant="solid" size="sm" onClick={() => { setModalMd(false); toast({ variant: "success", title: "Alterações salvas" }); }}>
                Salvar
              </Button>
            </ModalFooter>
          </Modal>

          {/* LG — Detail view */}
          <Modal open={modalLg} onClose={() => setModalLg(false)} size="lg" aria-labelledby="modal-lg-title">
            <ModalHeader onClose={() => setModalLg(false)}>
              <h2 id="modal-lg-title" className="text-lg font-semibold font-barlowcn uppercase tracking-wide text-yvy-navy">
                YVYQ11 — Visão do Fundo
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-y-6">
                <div className="grid grid-cols-2 gap-4 border border-black/10 p-4">
                  {[
                    ["Código CVM", "YVYQ11"],
                    ["CNPJ", "••.•••.•••/0001-••"],
                    ["Benchmark", "CDI + 4,0% a.a."],
                    ["Patrimônio Líquido", "R$ 1,2B"],
                    ["Cotas Emitidas", "10.000.000"],
                    ["Data de Início", "15/01/2025"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-y-0.5">
                      <span className="text-xs font-barlowcn uppercase tracking-wider text-yvy-navy/50">{label}</span>
                      <span className="text-sm font-barlow font-light">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-barlow font-light text-yvy-navy/70 leading-relaxed">
                  Fundo de Infraestrutura com foco em projetos de energia renovável, saneamento básico e mobilidade urbana no Brasil. Regulamentado pela Instrução CVM 175.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" size="sm" onClick={() => setModalLg(false)}>Fechar</Button>
              <Button variant="outline" size="sm">Exportar PDF</Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Section 13: Tabs */}
        <section id="tabs" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            13. Tabs
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            In-page navigation for Fund Detail and Investor Detail views. Supports
            keyboard arrow navigation, uncontrolled, and controlled modes. Two visual variants.
          </p>

          <div className="flex flex-col gap-y-8">
            <div className="flex flex-col gap-y-3">
              <span className="text-xs font-mono text-gray-400">Variant underline — uncontrolled (defaultValue)</span>
              <div className="bg-white border border-black/20 p-6">
                <Tabs defaultValue="overview" variant="underline">
                  <TabList>
                    <Tab value="overview">Visão Geral</Tab>
                    <Tab value="investors">Investidores</Tab>
                    <Tab value="documents">Documentos</Tab>
                    <Tab value="performance">Performance</Tab>
                  </TabList>
                  <TabPanel value="overview">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70 leading-relaxed">
                      Dados gerais do fundo YVYQ11 — patrimônio, benchmark, datas e documentos regulatórios. Use as setas ← → para navegar entre abas.
                    </p>
                  </TabPanel>
                  <TabPanel value="investors">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70 leading-relaxed">
                      Lista de cotistas do fundo com status KYC, cotas detidas e histórico de aportes.
                    </p>
                  </TabPanel>
                  <TabPanel value="documents">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70 leading-relaxed">
                      Regulamento, prospecto, comunicados ao mercado e relatórios periódicos disponíveis para download.
                    </p>
                  </TabPanel>
                  <TabPanel value="performance">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70 leading-relaxed">
                      Evolução da cota, retorno acumulado e comparação com o benchmark CDI+4,0% a.a.
                    </p>
                  </TabPanel>
                </Tabs>
              </div>
            </div>

            <div className="flex flex-col gap-y-3">
              <span className="text-xs font-mono text-gray-400">Variant pill — controlled (useState)</span>
              <div className="bg-white border border-black/20 p-6">
                <Tabs value={controlledTab} onValueChange={setControlledTab} variant="pill">
                  <TabList>
                    <Tab value="all">Todos</Tab>
                    <Tab value="active">Ativos</Tab>
                    <Tab value="captacao">Em Captação</Tab>
                    <Tab value="closed">Encerrados</Tab>
                  </TabList>
                  <TabPanel value="all">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70">
                      Exibindo todos os fundos da carteira — ativo selecionado via controlled state: <code className="font-mono text-xs bg-black/5 px-1">{controlledTab}</code>
                    </p>
                  </TabPanel>
                  <TabPanel value="active">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70">
                      YVYQ11 — Fundo de Infraestrutura (ativo, em operação)
                    </p>
                  </TabPanel>
                  <TabPanel value="captacao">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70">
                      Nenhum fundo em captação no momento.
                    </p>
                  </TabPanel>
                  <TabPanel value="closed">
                    <p className="text-sm font-barlow font-light text-yvy-navy/70">
                      Nenhum fundo encerrado.
                    </p>
                  </TabPanel>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* Section 14: DataList */}
        <section id="datalist" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            14. DataList
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Semantic key-value display for Fund Detail and Investor Detail headers — inception date, benchmark, CNPJ, suitability, address. Renders a{" "}
            <code className="font-mono text-xs bg-black/5 px-1">&lt;dl&gt;</code> for correct screen reader semantics.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Layout Horizontal (padrão)</CardTitle></CardHeader>
              <CardContent>
                <DataList>
                  <DataListRow label="Código CVM" value="YVYQ11" />
                  <DataListRow label="CNPJ" value="••.•••.•••/0001-••" />
                  <DataListRow label="Benchmark" value="CDI + 4,0% a.a." />
                  <DataListRow label="Patrimônio Líquido" value="R$ 1,2B" />
                  <DataListRow label="Data de Início" value="15/01/2025" />
                  <DataListRow
                    label="Status"
                    value={<Badge variant="success" size="sm">Ativo</Badge>}
                  />
                </DataList>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Layout Vertical</CardTitle></CardHeader>
              <CardContent>
                <DataList layout="vertical">
                  <DataListRow label="Nome Completo" value="João Mendes Silva" />
                  <DataListRow label="Tipo de Investidor" value="Qualificado (CVM 175)" />
                  <DataListRow label="Suitability" value="Moderado" />
                  <DataListRow
                    label="Status KYC"
                    value={<Badge variant="warning" size="sm">Pendente</Badge>}
                  />
                </DataList>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 15: Breadcrumb */}
        <section id="breadcrumb" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            15. Breadcrumb
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Wayfinding for all deep-link pages. Linked items use React Router{" "}
            <code className="font-mono text-xs bg-black/5 px-1">Link</code>; the current (last) item is plain text with{" "}
            <code className="font-mono text-xs bg-black/5 px-1">aria-current="page"</code>.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-y-5">
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Fund detail page</span>
                <Breadcrumb
                  items={[
                    { label: "Fundos", to: "/" },
                    { label: "YVYQ11" },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Deep fund sub-page</span>
                <Breadcrumb
                  items={[
                    { label: "Fundos", to: "/" },
                    { label: "YVYQ11", to: "/" },
                    { label: "Performance" },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Investor detail</span>
                <Breadcrumb
                  items={[
                    { label: "Investidores", to: "/" },
                    { label: "João Mendes Silva", to: "/" },
                    { label: "Documentos" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 16: Pagination */}
        <section id="pagination" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            16. Pagination
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Controlled pagination for large lists. Prev/Next disable at boundaries. Ellipsis collapses distant pages. Current page: <strong>{currentPage}</strong>.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-y-6">
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">247 items, 25 per page (10 pages)</span>
                <Pagination
                  totalItems={247}
                  pageSize={25}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
              <Divider />
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">With page size selector</span>
                <Pagination
                  totalItems={247}
                  pageSize={25}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  showPageSize
                  onPageSizeChange={() => {}}
                />
              </div>
              <Divider />
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">Small list (4 pages) — no ellipsis</span>
                <Pagination
                  totalItems={80}
                  pageSize={25}
                  currentPage={1}
                  onPageChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 17: RadioGroup */}
        <section id="radiogroup" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            17. RadioGroup
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Mutually exclusive selection for investor suitability classification and exclusive option sets.
            Native keyboard arrow navigation within the group.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Vertical (padrão) — com descrição</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup
                  value={suitability}
                  onValueChange={setSuitability}
                  name="suitability"
                >
                  <RadioItem
                    value="conservador"
                    label="Conservador"
                    description="Prioriza segurança e liquidez. Tolerância baixa a perdas."
                  />
                  <RadioItem
                    value="moderado"
                    label="Moderado"
                    description="Aceita oscilações moderadas em busca de retornos superiores."
                  />
                  <RadioItem
                    value="arrojado"
                    label="Arrojado"
                    description="Alta tolerância a risco. Foco em retorno de longo prazo."
                  />
                  <RadioItem
                    value="qualificado"
                    label="Qualificado (CVM 175)"
                    description="Investidor com mais de R$ 1M em investimentos financeiros."
                  />
                  <RadioItem
                    value="desabilitado"
                    label="Opção Desabilitada"
                    disabled
                  />
                </RadioGroup>
                <p className="mt-4 text-xs font-mono text-gray-400">
                  Selecionado: <strong>{suitability}</strong>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Horizontal — sem descrição</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup
                  value={timeframe}
                  onValueChange={setTimeframe}
                  layout="horizontal"
                  name="timeframe"
                >
                  <RadioItem value="1m" label="1M" />
                  <RadioItem value="3m" label="3M" />
                  <RadioItem value="6m" label="6M" />
                  <RadioItem value="12m" label="12M" />
                  <RadioItem value="itd" label="ITD" />
                </RadioGroup>
                <p className="mt-4 text-xs font-mono text-gray-400">
                  Período: <strong>{timeframe.toUpperCase()}</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 18: Divider */}
        <section id="divider" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            18. Divider
          </h2>
          <Card>
            <CardContent className="flex flex-col gap-y-6">
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Horizontal (padrão)</span>
                <Divider />
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Horizontal com label</span>
                <Divider label="OU" />
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="text-xs font-mono text-gray-400">Vertical (em flex row)</span>
                <div className="flex items-center gap-x-4 h-10">
                  <span className="text-sm font-barlow text-yvy-navy/60">Seção A</span>
                  <Divider orientation="vertical" />
                  <span className="text-sm font-barlow text-yvy-navy/60">Seção B</span>
                  <Divider orientation="vertical" />
                  <span className="text-sm font-barlow text-yvy-navy/60">Seção C</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 19: ChartContainer + Recharts */}
        <section id="charts" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            19. ChartContainer
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Library-agnostic wrapper for all charts — standardizes title, caption, timeframe actions, and loading/empty states. Demo uses Recharts <code className="font-mono text-xs bg-black/5 px-1">AreaChart</code>.
          </p>
          <div className="flex flex-col gap-y-6">
            <ChartContainer
              title="Valor da Cota — YVYQ11"
              caption="Evolução mensal jun/25 – mai/26"
              actions={
                <Tabs value={timeframe} onValueChange={setTimeframe} variant="pill">
                  <TabList>
                    <Tab value="1m">1M</Tab>
                    <Tab value="3m">3M</Tab>
                    <Tab value="12m">12M</Tab>
                    <Tab value="itd">ITD</Tab>
                  </TabList>
                </Tabs>
              }
            >
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={performanceData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cotaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#122C4F" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#122C4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(18,44,79,0.08)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fontFamily: "Barlow Condensed", fill: "rgba(18,44,79,0.4)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tick={{ fontSize: 10, fontFamily: "Barlow", fill: "rgba(18,44,79,0.4)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v.toFixed(0)}`}
                    width={36}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: 0,
                      fontSize: 12,
                      fontFamily: "Barlow",
                      color: "#122C4F",
                    }}
                    formatter={(value) => [`R$ ${(value as number).toFixed(2)}`, "Cota"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="cota"
                    stroke="#122C4F"
                    strokeWidth={1.5}
                    fill="url(#cotaGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#3E5FAA", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer title="Estado de Carregamento" loading />
              <ChartContainer title="Sem Dados" caption="Período sem registros" empty />
            </div>
          </div>
        </section>

        {/* Section 20: Stepper */}
        <section id="stepper" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            20. Stepper
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Multi-step progress indicator for investor onboarding and KYC flows. Display-only — parent controls{" "}
            <code className="font-mono text-xs bg-black/5 px-1">currentStep</code> (0-based). Use the buttons below to preview states.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-y-8">
              <Stepper
                currentStep={stepperStep}
                steps={[
                  { label: "Dados Pessoais", description: "Nome, CPF, endereço e contato" },
                  { label: "Documentos", description: "RG, comprovante de renda" },
                  { label: "Suitability", description: "Perfil de risco e objetivos" },
                  { label: "Revisão", description: "Confirme seus dados" },
                  { label: "Confirmação" },
                ]}
              />
              <div className="flex items-center gap-x-3 pt-2 border-t border-black/10">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={stepperStep === 0}
                  onClick={() => setStepperStep((s) => Math.max(0, s - 1))}
                >
                  ← Anterior
                </Button>
                <span className="text-xs font-mono text-gray-400">
                  Etapa {stepperStep + 1} de 5
                </span>
                <Button
                  size="sm"
                  disabled={stepperStep === 4}
                  onClick={() => setStepperStep((s) => Math.min(4, s + 1))}
                >
                  Próximo →
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 21: Avatar */}
        <section id="avatar" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            21. Avatar
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Profile images for investors, managers, and entities. Falls back to initials when no image is provided or image fails to load.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-y-8">
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">Initials — circle (default)</span>
                <div className="flex items-center gap-x-4">
                  <Avatar initials="JS" size="sm" />
                  <Avatar initials="MC" size="md" />
                  <Avatar initials="PA" size="lg" />
                </div>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">Initials — square (entities/funds)</span>
                <div className="flex items-center gap-x-4">
                  <Avatar initials="YV" size="sm" shape="square" />
                  <Avatar initials="YV" size="md" shape="square" />
                  <Avatar initials="YV" size="lg" shape="square" />
                </div>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">Image with fallback (broken src → shows initials)</span>
                <div className="flex items-center gap-x-4">
                  <Avatar
                    initials="JS"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop"
                    size="md"
                    alt="João Silva"
                  />
                  <Avatar initials="JS" src="/broken-url.jpg" size="md" alt="Broken image fallback" />
                </div>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">In context — investor table row</span>
                <div className="flex items-center gap-x-3 py-2 border-b border-black/10">
                  <Avatar initials="MC" size="sm" />
                  <div>
                    <p className="text-sm font-barlow font-light text-yvy-navy">Maria Cristina Alves</p>
                    <p className="text-xs font-barlow font-light text-yvy-navy/40">Investidor Profissional</p>
                  </div>
                  <Badge variant="success" size="sm" className="ml-auto">Aprovado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 22: Switch */}
        <section id="switch" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            22. Switch
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Binary toggle for settings and inline status. Uses{" "}
            <code className="font-mono text-xs bg-black/5 px-1">role="switch"</code> — controlled, no internal state.
          </p>
          <Card className="max-w-md">
            <CardContent className="flex flex-col gap-y-6">
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">Bare toggle (no label)</span>
                <div className="flex items-center gap-x-4">
                  <Switch checked={sw1} onCheckedChange={setSw1} id="sw1" />
                  <Switch checked={sw2} onCheckedChange={setSw2} id="sw2" />
                  <Switch checked={false} onCheckedChange={() => {}} disabled />
                  <Switch checked={true} onCheckedChange={() => {}} disabled />
                </div>
              </div>
              <div className="flex flex-col gap-y-4 pt-3 border-t border-black/10">
                <span className="text-xs font-mono text-gray-400">With label</span>
                <Switch
                  checked={sw1}
                  onCheckedChange={setSw1}
                  id="notif"
                  label="Notificações por e-mail"
                />
                <Switch
                  checked={sw2}
                  onCheckedChange={setSw2}
                  id="2fa"
                  label="Autenticação em dois fatores"
                />
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  disabled
                  label="Funcionalidade desabilitada"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 23: Tooltip */}
        <section id="tooltip" className="flex flex-col gap-y-6">
          <h2 className="text-3xl font-light font-barlowcn uppercase tracking-wider border-b border-black/10 pb-3">
            23. Tooltip
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-2xl">
            Pure-CSS hover + focus tooltip. Zero JS, zero positioning library. Hover or tab-focus the buttons below.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-y-8">
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">All 4 placements</span>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-6 py-4">
                  <Tooltip content="Adicionar investidor" placement="top">
                    <Button size="sm" variant="outline" aria-label="Adicionar investidor">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Arquivar registro" placement="bottom">
                    <Button size="sm" variant="outline" aria-label="Arquivar registro">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 5h12v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M1 3h14v2H1V3z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M6 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Exportar para PDF" placement="right">
                    <Button size="sm" variant="outline" aria-label="Exportar para PDF">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M8 10V3M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Ver detalhes completos" placement="left">
                    <Button size="sm" variant="ghost" aria-label="Ver detalhes">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 7v5M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </Button>
                  </Tooltip>
                </div>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-mono text-gray-400">On metric value (financial term definition)</span>
                <div className="flex items-center gap-x-2">
                  <span className="text-2xl font-light font-barlowcn text-yvy-navy">CDI + 4,2%</span>
                  <Tooltip content="Certificado de Depósito Interbancário — taxa de referência do mercado" placement="right">
                    <button
                      aria-label="O que é CDI?"
                      className="text-yvy-navy/30 hover:text-yvy-navy yvy-transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 7v5M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* Corporate Footnote */}
      <footer className="mt-24 border-t border-black/15 pt-12 text-center text-xs text-yvy-navy/55">
        <div className="max-w-[1366px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-y-4">
          <p>© {new Date().getFullYear()} Yvy Capital Asset Management. Todos os direitos reservados.</p>
          <p>Rua Joaquim Floriano, 960 | Itaim Bibi, São Paulo - SP</p>
        </div>
      </footer>
    </div>
  );
}
