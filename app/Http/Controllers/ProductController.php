<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('products/index', [
            'products' => Product::orderBy('id')->get(),
        ]);
    }

    public function store(ProductRequest $request)
    {
        Product::create($request->validated());

        return back();
    }

    public function update(ProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return back();
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back();
    }
}
