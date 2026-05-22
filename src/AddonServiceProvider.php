<?php

namespace Vizuall\CodeEditor;

use Statamic\Providers\AddonServiceProvider as BaseAddonServiceProvider;

class AddonServiceProvider extends BaseAddonServiceProvider
{
    protected $fieldtypes = [
        Fieldtypes\CodeEditor::class,
        Fieldtypes\CssEditor::class,
    ];

    protected $scripts = [
        __DIR__.'/../resources/js/addon.js',
    ];

    protected $stylesheets = [
        __DIR__.'/../resources/css/addon.css',
    ];
}
