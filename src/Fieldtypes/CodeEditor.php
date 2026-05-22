<?php

namespace Vizuall\CodeEditor\Fieldtypes;

use Statamic\Fields\Fieldtype;

class CodeEditor extends Fieldtype
{
    protected static $handle = 'code_editor';

    public function component(): string
    {
        return 'code-editor';
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
