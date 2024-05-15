import { React } from "/modules/official/stdlib/src/expose/React.js";
import { t } from "../i18n.js";
import { Module } from "/hooks/module.js";
import ModuleCard from "../components/ModuleCard/index.js";
import { settingsButton } from "../../index.js";
import { CONFIG } from "../settings.js";
import { getProp, useChipFilter, useDropdown, useSearchBar } from "/modules/official/stdlib/lib/components/index.js";
const SortOptions = {
    default: ()=>t("sort.default"),
    "a-z": ()=>t("sort.a-z"),
    "z-a": ()=>t("sort.z-a"),
    random: ()=>t("sort.random")
};
const SortFns = {
    default: null,
    "a-z": (a, b)=>b.name > a.name ? 1 : a.name > b.name ? -1 : 0,
    "z-a": (a, b)=>a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
    random: ()=>Math.random() - 0.5
};
const enabled = {
    enabled: {
        "": t("filter.enabled")
    }
};
const getFilters = ()=>({
        "": null,
        themes: {
            "": t("filter.themes"),
            ...enabled
        },
        extensions: {
            "": t("filter.extensions"),
            ...enabled
        },
        apps: {
            "": t("filter.apps"),
            ...enabled
        },
        snippets: {
            "": t("filter.snippets"),
            ...enabled
        },
        libs: {
            "": CONFIG.showLibs && t("filter.libs")
        }
    });
const libTags = new Set([
    "lib",
    "npm",
    "internal"
]);
const isModLib = (mod)=>new Set(mod.metadata.tags).intersection(libTags).size > 0;
const enabledFn = {
    enabled: {
        "": ({ moduleInst: mod })=>mod.isLoaded()
    }
};
const filterFNs = {
    "": ({ moduleInst: mod })=>CONFIG.showLibs || !isModLib(mod),
    themes: {
        "": ({ moduleInst: mod })=>mod.metadata.tags.includes("theme"),
        ...enabledFn
    },
    apps: {
        "": ({ moduleInst: mod })=>mod.metadata.tags.includes("app"),
        ...enabledFn
    },
    extensions: {
        "": ({ moduleInst: mod })=>mod.metadata.tags.includes("extension"),
        ...enabledFn
    },
    snippets: {
        "": ({ moduleInst: mod })=>mod.metadata.tags.includes("snippet"),
        ...enabledFn
    },
    libs: {
        "": isModLib
    }
};
export default function() {
    const [searchbar, search] = useSearchBar({
        placeholder: t("pages.marketplace.search_modules"),
        expanded: true
    });
    const [sortbox, sortOption] = useDropdown({
        options: SortOptions
    });
    const sortFn = SortFns[sortOption];
    const [chipFilter, selectedFilters] = useChipFilter(getFilters());
    const selectedFilterFNs = selectedFilters.map(({ key })=>getProp(filterFNs, key));
    const propsList = React.useMemo(()=>Module.getAll().flatMap((module)=>{
            const selectedVersion = module.getEnabledVersion() || module.instances.keys().next().value;
            const moduleInst = module.instances.get(selectedVersion);
            return moduleInst ? [
                {
                    moduleInst,
                    showTags: true
                }
            ] : [];
        }), []);
    return /*#__PURE__*/ React.createElement("section", {
        className: "contentSpacing"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header items-center flex justify-between pb-2 flex-row z-10"
    }, /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header__left flex gap-2"
    }, chipFilter), /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-header__right flex gap-2 items-center"
    }, /*#__PURE__*/ React.createElement("p", {
        className: "inline-flex self-center font-bold text-sm"
    }, t("pages.marketplace.sort.label")), sortbox, searchbar, settingsButton)), /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
        className: "marketplace-grid main-gridContainer-gridContainer main-gridContainer-fixedWidth"
    }, selectedFilterFNs.reduce((acc, fn)=>acc.filter(fn), propsList).filter(({ moduleInst })=>{
        const { name, tags, authors } = moduleInst.metadata;
        const searchFiels = [
            name,
            ...tags,
            ...authors
        ];
        return searchFiels.some((f)=>f.toLowerCase().includes(search.toLowerCase()));
    }).sort((a, b)=>sortFn?.(a.moduleInst.metadata, b.moduleInst.metadata)).map((props)=>/*#__PURE__*/ React.createElement(ModuleCard, {
            key: props.identifier,
            ...props
        })))));
}
