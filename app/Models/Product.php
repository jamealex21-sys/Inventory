<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['sku', 'name', 'category', 'price', 'stock'];
    protected $casts = ['price' => 'float', 'stock' => 'integer'];
    protected $appends = ['total_value', 'status'];

    public function getTotalValueAttribute(): float
    {
        return round($this->price * $this->stock, 2);
    }

    public function getStatusAttribute(): string
    {
        if ($this->stock === 0) return 'out';
        return $this->stock <= 5 ? 'low' : 'in';
    }
}
