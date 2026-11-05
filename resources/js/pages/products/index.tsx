import { Head, router, useForm } from '@inertiajs/react';
import {
    Boxes,
    DollarSign,
    Eye,
    Hash,
    Package,
    Pencil,
    Plus,
    Search,
    ShieldAlert,
    Tag,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Product = {
    id: number;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    total_value: number;
    status: 'in' | 'low' | 'out';
};

type ProductFields = {
    sku: string;
    name: string;
    category: string;
    price: string;
    stock: string;
};

type DialogMode = 'view' | 'create' | 'edit' | 'delete' | null;

const categories = ['Electronics', 'Accessories', 'Furniture', 'Other'];

const initialForm: ProductFields = {
    sku: '',
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
};

const money = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);

const statusDetails = {
    in: {
        label: 'In Stock',
        className: 'border-emerald-500/60 bg-emerald-500/5 text-emerald-400',
    },
    low: {
        label: 'Low Stock',
        className: 'border-amber-500/60 bg-amber-500/5 text-amber-400',
    },
    out: {
        label: 'Out of Stock',
        className: 'border-red-900 bg-red-950 text-red-100',
    },
};

export default function Index({ products }: { products: Product[] }) {
    const [search, setSearch] = useState('');
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const form = useForm<ProductFields>(initialForm);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return products.filter((product) =>
            [product.sku, product.name, product.category].some((value) =>
                value.toLowerCase().includes(query),
            ),
        );
    }, [products, search]);

    const totalValue = products.reduce(
        (sum, product) => sum + product.total_value,
        0,
    );
    const lowStockCount = products.filter(
        (product) => product.status === 'low',
    ).length;
    const outOfStockCount = products.filter(
        (product) => product.status === 'out',
    ).length;

    const openCreateDialog = () => {
        setSelectedProduct(null);
        form.reset();
        form.clearErrors();
        setDialogMode('create');
    };

    const openEditDialog = (product: Product) => {
        setSelectedProduct(product);
        form.clearErrors();
        form.setData({
            sku: product.sku,
            name: product.name,
            category: product.category,
            price: String(product.price),
            stock: String(product.stock),
        });
        setDialogMode('edit');
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => setDialogMode(null),
        };

        if (dialogMode === 'edit' && selectedProduct) {
            form.put(`/products/${selectedProduct.id}`, options);
        } else {
            form.post('/products', options);
        }
    };

    const removeProduct = (product: Product) => {
        setSelectedProduct(product);
        setDialogMode('delete');
    };

    const confirmDelete = () => {
        if (!selectedProduct) return;

        router.delete(`/products/${selectedProduct.id}`, {
            preserveScroll: true,
            onStart: () => setDeleteProcessing(true),
            onSuccess: () => setDialogMode(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <div className="dark min-h-screen bg-black p-3 text-white sm:p-5 lg:p-8">
            <Head title="Inventory" />

            <main className="mx-auto max-w-[1360px] rounded-2xl border border-neutral-800 bg-[#090909] p-5 sm:p-7 lg:p-8">
                <section
                    aria-label="Inventory summary"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <SummaryCard
                        title="Total Products"
                        value={products.length.toLocaleString()}
                        icon={<Package />}
                        tone="neutral"
                    />
                    <SummaryCard
                        title="Total Value"
                        value={money(totalValue)}
                        icon={<DollarSign />}
                        tone="blue"
                    />
                    <SummaryCard
                        title="Low Stock Alert"
                        value={lowStockCount.toLocaleString()}
                        icon={<TriangleAlert />}
                        tone="amber"
                    />
                    <SummaryCard
                        title="Out of Stock"
                        value={outOfStockCount.toLocaleString()}
                        icon={<ShieldAlert />}
                        tone="red"
                    />
                </section>

                <div className="my-7 flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-[400px]">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            aria-label="Search products"
                            placeholder="Search product, SKU, or category..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-10 border-neutral-800 bg-transparent pl-10 text-white placeholder:text-neutral-400"
                        />
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="shrink-0 bg-blue-600 text-white hover:bg-blue-500"
                    >
                        <Plus />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                    <table className="w-full min-w-[980px] text-left text-sm">
                        <thead className="bg-neutral-800/80">
                            <tr>
                                {[
                                    'SKU',
                                    'Product Name',
                                    'Category',
                                    'Unit Price',
                                    'Stock Qty',
                                    'Total Value',
                                    'Status',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        scope="col"
                                        className="px-5 py-4 font-semibold"
                                    >
                                        {heading}
                                    </th>
                                ))}
                                <th
                                    scope="col"
                                    className="px-5 py-4 text-right font-semibold"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-white/[0.02]"
                                >
                                    <td className="px-5 py-4">
                                        <span className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 font-mono text-xs font-semibold">
                                            {product.sku}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-semibold">
                                        {product.name}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="rounded-lg bg-neutral-800 px-2.5 py-1 text-xs font-semibold">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-mono tabular-nums">
                                        {money(product.price)}
                                    </td>
                                    <td className="px-5 py-4 text-center tabular-nums">
                                        {product.stock.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-4 font-mono font-semibold tabular-nums">
                                        {money(product.total_value)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge status={product.status} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`View ${product.name}`}
                                                className="text-neutral-400 hover:text-white"
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setDialogMode('view');
                                                }}
                                            >
                                                <Eye />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${product.name}`}
                                                className="text-blue-400 hover:text-blue-300"
                                                onClick={() =>
                                                    openEditDialog(product)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${product.name}`}
                                                className="text-rose-500 hover:text-rose-400"
                                                onClick={() =>
                                                    removeProduct(product)
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-5 py-12 text-center text-neutral-400"
                                    >
                                        {products.length === 0
                                            ? 'No products yet.'
                                            : 'No products match your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <Dialog
                open={dialogMode !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDialogMode(null);
                        form.clearErrors();
                    }
                }}
            >
                <DialogContent className="gap-0 border-neutral-800 bg-[#0b0b0b] p-5 text-white sm:max-w-[560px]">
                    {dialogMode === 'view' && selectedProduct ? (
                        <>
                            <DialogHeader className="flex-row items-center gap-3 border-b border-neutral-800 pb-5">
                                <span className="flex size-9 items-center justify-center rounded-full bg-white text-black">
                                    <Eye className="size-5" />
                                </span>
                                <DialogTitle className="text-xl">
                                    Product Details
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center justify-between gap-3 pt-5">
                                <span className="rounded-lg border border-blue-800 bg-blue-950/60 px-2.5 py-1 font-mono text-sm font-bold text-blue-400">
                                    {selectedProduct.sku}
                                </span>
                                <StatusBadge status={selectedProduct.status} />
                            </div>
                            <h3 className="mt-3 text-lg font-bold">
                                {selectedProduct.name}
                            </h3>
                            <dl className="mt-5 grid grid-cols-2 gap-3">
                                <ProductDetail
                                    label="Category"
                                    value={selectedProduct.category}
                                />
                                <ProductDetail
                                    label="Unit Price"
                                    value={money(selectedProduct.price)}
                                />
                                <ProductDetail
                                    label="Stock on Hand"
                                    value={`${selectedProduct.stock.toLocaleString()} units`}
                                />
                                <ProductDetail
                                    label="Calculated Value"
                                    value={money(selectedProduct.total_value)}
                                    accent
                                />
                            </dl>
                        </>
                    ) : dialogMode === 'delete' && selectedProduct ? (
                        <>
                            <DialogHeader className="gap-3">
                                <DialogTitle className="flex items-center gap-3 text-xl text-rose-400">
                                    <span className="flex size-9 items-center justify-center rounded-full bg-rose-950 text-rose-400">
                                        <Trash2 className="size-5" />
                                    </span>
                                    Confirm Delete
                                </DialogTitle>
                                <DialogDescription className="text-left text-base leading-relaxed text-neutral-400">
                                    Are you sure you want to permanently remove
                                    this product from the inventory catalog?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                                <div className="flex flex-wrap items-center gap-2 font-semibold">
                                    <span className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 font-mono text-xs">
                                        {selectedProduct.sku}
                                    </span>
                                    <span>{selectedProduct.name}</span>
                                </div>
                                <p className="mt-2 text-sm text-neutral-400">
                                    Category: {selectedProduct.category} ·
                                    Price: {money(selectedProduct.price)} ·
                                    Stock: {selectedProduct.stock}
                                </p>
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                                Deleting this item will remove it from the
                                product list and immediately recalculate total
                                value and summary totals.
                            </p>
                            <DialogFooter className="mt-6">
                                <Button
                                    variant="destructive"
                                    disabled={deleteProcessing}
                                    onClick={confirmDelete}
                                    className="bg-red-800 text-white hover:bg-red-700"
                                >
                                    <Trash2 />
                                    {deleteProcessing
                                        ? 'Deleting...'
                                        : 'Delete'}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={deleteProcessing}
                                    onClick={() => setDialogMode(null)}
                                    className="border-neutral-700 bg-transparent text-white hover:bg-neutral-900"
                                >
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader className="mb-5">
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                    <span
                                        className={`flex size-9 items-center justify-center rounded-full ${dialogMode === 'edit' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}
                                    >
                                        {dialogMode === 'edit' ? (
                                            <Pencil className="size-5" />
                                        ) : (
                                            <Plus className="size-5" />
                                        )}
                                    </span>
                                    {dialogMode === 'edit'
                                        ? 'Edit Product'
                                        : 'Add New Product'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-5">
                                <FormField
                                    id="name"
                                    label="Product Name"
                                    icon={<Tag />}
                                    value={form.data.name}
                                    error={form.errors.name}
                                    placeholder="e.g. Wireless Ergonomic Mouse"
                                    onChange={(value) =>
                                        form.setData('name', value)
                                    }
                                    required
                                />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        id="sku"
                                        label="SKU"
                                        icon={<Hash />}
                                        value={form.data.sku}
                                        error={form.errors.sku}
                                        placeholder="PRD-1001"
                                        onChange={(value) =>
                                            form.setData('sku', value)
                                        }
                                        readOnly={dialogMode === 'edit'}
                                        required
                                    />
                                    <CategoryField
                                        value={form.data.category}
                                        error={form.errors.category}
                                        options={[
                                            ...new Set([
                                                ...categories,
                                                form.data.category,
                                            ]),
                                        ]}
                                        onChange={(value) =>
                                            form.setData('category', value)
                                        }
                                    />
                                    <FormField
                                        id="price"
                                        label="Unit Price"
                                        icon={<DollarSign />}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.data.price}
                                        error={form.errors.price}
                                        placeholder="0.00"
                                        onChange={(value) =>
                                            form.setData('price', value)
                                        }
                                        required
                                    />
                                    <FormField
                                        id="stock"
                                        label="Stock Quantity"
                                        icon={<Boxes />}
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={form.data.stock}
                                        error={form.errors.stock}
                                        placeholder="0 or more"
                                        onChange={(value) =>
                                            form.setData('stock', value)
                                        }
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogMode(null)}
                                        className="border-neutral-700 bg-transparent text-white hover:bg-neutral-900"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="bg-blue-600 text-white hover:bg-blue-500"
                                    >
                                        {form.processing
                                            ? 'Saving...'
                                            : dialogMode === 'edit'
                                              ? 'Save Changes'
                                              : 'Save Product'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    tone,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    tone: 'neutral' | 'blue' | 'amber' | 'red';
}) {
    const toneClasses = {
        neutral: {
            card: 'border-neutral-800',
            heading: 'text-neutral-300',
            value: 'text-white',
            icon: 'text-blue-500',
        },
        blue: {
            card: 'border-blue-950',
            heading: 'text-blue-400',
            value: 'text-blue-400',
            icon: 'text-blue-400',
        },
        amber: {
            card: 'border-amber-900',
            heading: 'text-amber-400',
            value: 'text-amber-400',
            icon: 'text-amber-400',
        },
        red: {
            card: 'border-red-950',
            heading: 'text-rose-400',
            value: 'text-rose-400',
            icon: 'text-rose-400',
        },
    };
    const colors = toneClasses[tone];

    return (
        <section
            className={`rounded-xl border bg-[#0b0b0b] p-5 ${colors.card}`}
        >
            <div className="flex items-center justify-between gap-3">
                <h2 className={`font-semibold ${colors.heading}`}>{title}</h2>
                <span aria-hidden="true" className={colors.icon}>
                    {icon}
                </span>
            </div>
            <p
                className={`mt-3 text-3xl font-bold tracking-tight ${colors.value}`}
            >
                {value}
            </p>
        </section>
    );
}

function FormField({
    id,
    label,
    icon,
    value,
    error,
    onChange,
    type = 'text',
    min,
    step,
    maxLength,
    placeholder,
    readOnly = false,
    required = false,
}: {
    id: string;
    label: string;
    icon: React.ReactNode;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    type?: string;
    min?: string;
    step?: string;
    maxLength?: number;
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="flex items-center gap-1.5 text-sm font-semibold"
            >
                <span className="size-4 text-neutral-400 [&_svg]:size-4">
                    {icon}
                </span>
                {label}
            </label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                min={min}
                step={step}
                maxLength={maxLength}
                placeholder={placeholder}
                readOnly={readOnly}
                required={required}
                aria-invalid={Boolean(error)}
                autoComplete="off"
                className={`h-10 border-neutral-800 bg-transparent text-white placeholder:text-neutral-500 ${readOnly ? 'font-semibold' : ''}`}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
    );
}

function CategoryField({
    value,
    error,
    options,
    onChange,
}: {
    value: string;
    error?: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor="category"
                className="flex items-center gap-1.5 text-sm font-semibold"
            >
                <span className="size-4 text-neutral-400">
                    <Boxes className="size-4" />
                </span>
                Category
            </label>
            <select
                id="category"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                aria-invalid={Boolean(error)}
                required
                className="h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-white outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/50"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
    );
}

function ProductDetail({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div className="rounded-xl border border-neutral-800 p-3">
            <dt className="text-sm text-neutral-400">{label}</dt>
            <dd
                className={`mt-1 font-bold ${accent ? 'text-blue-400' : 'text-white'}`}
            >
                {value}
            </dd>
        </div>
    );
}

function StatusBadge({ status }: { status: Product['status'] }) {
    return (
        <Badge
            variant="outline"
            className={`gap-1.5 rounded-full px-3 py-1 font-semibold ${statusDetails[status].className}`}
        >
            {status !== 'out' && (
                <span className="size-1.5 rounded-full bg-current" />
            )}
            {statusDetails[status].label}
        </Badge>
    );
}
