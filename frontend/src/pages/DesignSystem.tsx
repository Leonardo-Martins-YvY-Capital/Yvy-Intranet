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

export default function DesignSystem() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);

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
