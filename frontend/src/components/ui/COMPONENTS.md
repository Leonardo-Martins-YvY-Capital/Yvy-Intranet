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

## Upcoming (Sprint 2)
- `Toast.tsx` — `Toast`, `ToastProvider`, `useToast` hook
- `Modal.tsx` — `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`
- `Tabs.tsx` — `Tabs`, `TabList`, `Tab`, `TabPanel`
- `Textarea.tsx` — single export (forwardRef, mirrors Input)

## Upcoming (Sprint 3)
- `DataList.tsx`, `Breadcrumb.tsx`, `Pagination.tsx`, `RadioGroup.tsx`, `Divider.tsx`, `ChartContainer.tsx`

## Upcoming (Sprint 4)
- `Stepper.tsx`, `Avatar.tsx`, `Switch.tsx`, `Tooltip.tsx`
