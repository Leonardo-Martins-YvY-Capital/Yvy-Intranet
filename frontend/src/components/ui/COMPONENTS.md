# UI Component Index

All components live in `frontend/src/components/ui/`. Import from their file directly.  
Design tokens: `yvy-navy` (#122C4F), `yvy-royal` (#3E5FAA). Fonts: `font-barlowcn` (headings/labels/buttons), `font-barlow` (body).  
All new components must use `cn()` from `../../lib/utils` and follow existing patterns.

---

## Accordion
File: `Accordion.tsx`  
Exports: `Accordion`, `AccordionItem`  
Props (`AccordionItem`): `title: string`, `children: ReactNode`, `isOpenDefault?: boolean`  
Usage: `<Accordion><AccordionItem title="Políticas">...</AccordionItem></Accordion>`

---

## Alert
File: `Alert.tsx`  
Props: `variant?: "info"|"success"|"warning"|"error"`, `title?: string`, `onDismiss?: () => void`, `children`  
Usage: `<Alert variant="error" title="Credenciais Inválidas">Verifique e-mail ou senha.</Alert>`

---

## Badge
File: `Badge.tsx`  
Props: `variant?: "success"|"warning"|"danger"|"neutral"|"info"`, `size?: "sm"|"md"`, `children: string`  
Usage: `<Badge variant="success">Aprovado</Badge>`  
Note: `size="sm"` for table cells, `size="md"` (default) for standalone use.

---

## Button
File: `Button.tsx`  
Props: `variant?: "solid"|"outline"|"ghost"`, `size?: "sm"|"md"|"lg"`, extends `ButtonHTMLAttributes`  
Usage: `<Button variant="outline" size="sm">Download PDF</Button>`

---

## Card
File: `Card.tsx`  
Exports: `Card`, `CardHeader`, `CardTitle`, `CardContent`  
Usage: `<Card><CardHeader><CardTitle>Título</CardTitle></CardHeader><CardContent>...</CardContent></Card>`

---

## Checkbox
File: `Checkbox.tsx`  
Props: `indeterminate?: boolean`, extends `InputHTMLAttributes` (minus `type`)  
Usage: `<Checkbox checked={val} onChange={fn} />`  
Note: uses `.yvy-checkbox` CSS class from `index.css`. For select-all table headers, pass `indeterminate`.

---

## EmptyState
File: `EmptyState.tsx`  
Props: `title: string`, `description?: string`, `action?: ReactNode`, `icon?: ReactNode`, `className?: string`  
Usage: `<EmptyState title="Sem investidores" description="..." action={<Button>Cadastrar</Button>} />`

---

## Input
File: `Input.tsx`  
Props: extends `InputHTMLAttributes`, `type` defaults to `"text"`  
Usage: `<Input id="nome" placeholder="Digite aqui..." />`

---

## Label
File: `Label.tsx`  
Props: extends `LabelHTMLAttributes`  
Usage: `<Label htmlFor="nome">Nome Completo</Label>`

---

## Logo
File: `Logo.tsx`  
Props: `width?: number`, `height?: number`, `fillColor?: string`, extends `SVGProps`  
Usage: `<Logo width={180} height={96} fillColor="#ffffff" />`

---

## Select
File: `Select.tsx`  
Props: `placeholder?: string`, extends `SelectHTMLAttributes`  
Usage: `<Select placeholder="Selecione..."><option value="a">Opção A</option></Select>`  
Note: native `<select>` with custom chevron arrow; mirrors `Input` styling exactly.

---

## Skeleton / SkeletonText
File: `Skeleton.tsx`  
Exports: `Skeleton`, `SkeletonText`  
Props (`Skeleton`): `className?: string`  
Props (`SkeletonText`): `lines?: number` (default 3), `className?: string`  
Usage: `<Skeleton className="h-10 w-32" />` | `<SkeletonText lines={4} />`  
Note: uses `.skeleton-shimmer` keyframe from `index.css`.

---

## StatCard
File: `StatCard.tsx`  
Props: `label: string`, `value: string|number`, `delta?: { value: string; direction: "up"|"down"|"neutral" }`, `caption?: string`, `loading?: boolean`, `className?: string`  
Usage: `<StatCard label="AUM Total" value="R$ 1,2B" delta={{ value: "+8,4%", direction: "up" }} caption="vs. dez/24" />`

---

## Table
File: `Table.tsx`  
Exports: `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`  
Props (`Table`): `striped?: boolean`  
Props (`TableRow`): `onRowClick?: () => void`  
Props (`TableHeaderCell`): `sortable?: boolean`, `sortDirection?: "asc"|"desc"|null`, `onSort?: () => void`  
Usage:
```tsx
<Table striped>
  <TableHead>
    <TableRow>
      <TableHeaderCell sortable sortDirection={dir} onSort={fn}>Nome</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow onRowClick={() => navigate(`/investidores/${id}`)}>
      <TableCell>João Silva</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Tabs
File: `Tabs.tsx`  
Exports: `Tabs`, `TabList`, `Tab`, `TabPanel`  
Props (`Tabs`): `defaultValue?: string` (uncontrolled), `value?: string` + `onValueChange?` (controlled), `variant?: "underline"|"pill"`  
Props (`Tab`): `value: string`  
Props (`TabPanel`): `value: string`  
Usage:
```tsx
<Tabs defaultValue="overview">
  <TabList><Tab value="overview">Visão Geral</Tab><Tab value="docs">Documentos</Tab></TabList>
  <TabPanel value="overview">...</TabPanel>
  <TabPanel value="docs">...</TabPanel>
</Tabs>
```
Note: `TabList` handles ArrowRight/Left/Home/End keyboard navigation automatically. `hidden` attribute used on inactive panels (preserves panel state on switch).

---

## Textarea
File: `Textarea.tsx`  
Props: `rows?: number` (default 4), `resize?: "none"|"vertical"` (default "vertical"), extends `TextareaHTMLAttributes`  
Usage: `<Textarea id="obs" placeholder="Observações..." />`  
Note: identical className block to `Input` — same border, focus ring, disabled state.

---

## Toast / ToastProvider / useToast
File: `Toast.tsx`  
Exports: `ToastProvider`, `useToast`  
Setup: `ToastProvider` wraps `<App />` in `main.tsx` — already configured.  
Usage:
```tsx
const { toast } = useToast();
toast({ variant: "success", title: "Salvo", description: "Opcional." });
// variants: "success" | "error" | "warning" | "info"
// duration?: number (default 5000ms)
```
Note: max 5 toasts stacked; newest at top; portal renders to `document.body` top-right; dismiss via × or auto-timeout.

---

## Modal
File: `Modal.tsx`  
Exports: `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`  
Props (`Modal`): `open: boolean`, `onClose: () => void`, `size?: "sm"|"md"|"lg"|"full"`  
Props (`ModalHeader`): `onClose?: () => void` (renders × button)  
Usage:
```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} size="md" aria-labelledby="title-id">
  <ModalHeader onClose={() => setIsOpen(false)}>
    <h2 id="title-id" className="text-lg font-semibold font-barlowcn uppercase tracking-wide">Título</h2>
  </ModalHeader>
  <ModalBody>...</ModalBody>
  <ModalFooter>
    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancelar</Button>
    <Button size="sm">Confirmar</Button>
  </ModalFooter>
</Modal>
```
Note: native `<dialog>` — browser handles focus trap and Escape key. Scroll locks via CSS `body:has(dialog[open])`. Backdrop click also closes. Pass `aria-labelledby` pointing to heading id inside `ModalHeader`.

---

## Breadcrumb
File: `Breadcrumb.tsx`  
Props: `items: { label: string; to?: string }[]`, `className?: string`  
Usage: `<Breadcrumb items={[{ label: "Fundos", to: "/" }, { label: "YVYQ11" }]} />`  
Note: last item (no `to`) renders as current page with `aria-current="page"`. Uses React Router `Link` for linked items.

---

## ChartContainer
File: `ChartContainer.tsx`  
Props: `title: string`, `caption?: string`, `loading?: boolean`, `empty?: boolean`, `actions?: ReactNode`, `children`  
Usage:
```tsx
<ChartContainer title="Valor da Cota" caption="Jun/25–Mai/26" actions={<Tabs ...>...</Tabs>}>
  <ResponsiveContainer>...</ResponsiveContainer>
</ChartContainer>
```
Note: library-agnostic container. `loading` shows skeleton; `empty` shows EmptyState. Recharts is installed (`npm install recharts` done).

---

## DataList / DataListRow
File: `DataList.tsx`  
Exports: `DataList`, `DataListRow`  
Props (`DataList`): `layout?: "horizontal"|"vertical"` (default "horizontal")  
Props (`DataListRow`): `label: string`, `value: ReactNode`, `className?: string`  
Usage:
```tsx
<DataList>
  <DataListRow label="Benchmark" value="CDI + 4,0%" />
  <DataListRow label="Status" value={<Badge variant="success">Ativo</Badge>} />
</DataList>
```
Note: renders `<dl>/<dt>/<dd>` — semantically correct for key-value metadata. Horizontal = 2-col grid; Vertical = stacked.

---

## Divider
File: `Divider.tsx`  
Props: `orientation?: "horizontal"|"vertical"`, `label?: string`, `className?: string`  
Usage: `<Divider />` | `<Divider label="OU" />` | `<Divider orientation="vertical" />`

---

## Pagination
File: `Pagination.tsx`  
Props: `totalItems: number`, `pageSize: number`, `currentPage: number` (1-based), `onPageChange: (page) => void`, `showPageSize?: boolean`, `onPageSizeChange?: (size) => void`, `pageSizeOptions?: number[]` (default [25,50,100])  
Usage: `<Pagination totalItems={247} pageSize={25} currentPage={page} onPageChange={setPage} />`  
Note: pure controlled component, no internal state. Ellipsis algorithm: always shows page 1, last, and ±1 around current; gaps >2 become `…`.

---

## RadioGroup / RadioItem
File: `RadioGroup.tsx`  
Exports: `RadioGroup`, `RadioItem`  
Props (`RadioGroup`): `value: string`, `onValueChange: (v) => void`, `name?: string`, `layout?: "vertical"|"horizontal"` (default "vertical")  
Props (`RadioItem`): `value: string`, `label: string`, `description?: string`, `disabled?: boolean`  
Usage:
```tsx
<RadioGroup value={val} onValueChange={setVal} name="suitability">
  <RadioItem value="conservador" label="Conservador" description="Tolerância baixa a risco." />
  <RadioItem value="qualificado" label="Qualificado (CVM 175)" />
</RadioGroup>
```
Note: uses `.yvy-radio` CSS class from `index.css`. Native `<input type="radio">` handles arrow-key navigation automatically within the group.

---

## Avatar
File: `Avatar.tsx`  
Props: `initials: string` (required), `src?: string`, `size?: "sm"|"md"|"lg"` (default "md"), `shape?: "circle"|"square"` (default "circle"), `alt?: string`  
Usage: `<Avatar initials="JS" size="md" />` | `<Avatar initials="JS" src="/photo.jpg" />`  
Note: `src` fails gracefully — `onError` switches to initials. Shape "square" has no rounding (flat aesthetic). Shape "circle" uses `rounded-full`.

---

## Stepper
File: `Stepper.tsx`  
Props: `steps: { label: string; description?: string }[]`, `currentStep: number` (0-based), `className?: string`  
Usage: `<Stepper steps={[{ label: "Dados" }, { label: "Docs" }]} currentStep={1} />`  
Note: display-only, parent controls `currentStep`. Completed = navy fill + checkmark; current = royal fill + number; upcoming = muted border. Description only shown on the current step.

---

## Switch
File: `Switch.tsx`  
Props: `checked: boolean`, `onCheckedChange: (v: boolean) => void`, `disabled?: boolean`, `label?: string`, `id?: string`  
Usage: `<Switch checked={val} onCheckedChange={setVal} label="Notificações" id="notif" />`  
Note: uses `role="switch"` on a `<button>` — not an `<input>`. forwardRef on button. When `label` is provided, wraps in `<label>` automatically.

---

## Tooltip
File: `Tooltip.tsx`  
Props: `content: string`, `placement?: "top"|"bottom"|"left"|"right"` (default "top"), `children: ReactNode`  
Usage: `<Tooltip content="Arquivar registro"><Button aria-label="Arquivar">...</Button></Tooltip>`  
Note: pure CSS — no JS or positioning library. Shows on hover AND keyboard focus-within. Import as `Tooltip` from this file; if you also use Recharts' `Tooltip`, alias one: `import { Tooltip as RechartsTooltip } from "recharts"`.

---

## Upcoming (Sprint 4)
- `Stepper.tsx`, `Avatar.tsx`, `Switch.tsx`, `Tooltip.tsx`
