<?php

namespace Vizuall\CodeEditor\Fieldtypes;

use Statamic\Fields\Fieldtype;

class CssEditor extends Fieldtype
{
    protected static $handle = 'css_editor';

    public function component(): string
    {
        return 'css-editor';
    }

    public function preProcess($value): string
    {
        if (is_array($value)) return '';
        return (string) ($value ?? '');
    }

    public function process($value): string
    {
        if (is_array($value)) return '';
        return (string) ($value ?? '');
    }
}
