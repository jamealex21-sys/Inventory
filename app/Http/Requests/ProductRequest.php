<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $id = $this->route('product')?->id;

        return [
            'sku'      => ['required', 'string', 'max:32', Rule::unique('products', 'sku')->ignore($id)],
            'name'     => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:50'],
            'price'    => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'stock'    => ['required', 'integer', 'min:0'],
        ];
    }
}