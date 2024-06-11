import { classnames } from "/modules/official/stdlib/src/webpack/ClassNames.js";
import { useUpdate } from "../../util/index.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
import { useLocation, usePanelAPI } from "/modules/official/stdlib/src/webpack/CustomHooks.js";
import { PanelContent, PanelHeader, PanelSkeleton } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
import { ScrollableText } from "/modules/official/stdlib/src/webpack/ReactComponents.js";
export default function(props) {
    const [ref, setRef] = React.useState(null);
    const m = React.useMemo(()=>import("../../pages/Marketplace.js"), []);
    React.useEffect(()=>void m.then((m)=>m.refresh?.()), [
        ref
    ]);
    React.useEffect(()=>()=>void m.then((m)=>m.unselect?.()), []);
    const location = useLocation();
    const { panelSend } = usePanelAPI();
    if (location.pathname !== "/bespoke/marketplace") {
        panelSend("panel_close_click_or_collapse");
    }
    return /*#__PURE__*/ React.createElement(PanelSkeleton, {
        label: "Marketplace"
    }, /*#__PURE__*/ React.createElement(PanelContent, null, /*#__PURE__*/ React.createElement("div", {
        id: "MarketplacePanel",
        ref: (r)=>setRef(r)
    })));
}
export const VersionListContent = (props)=>{
    return /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement(PanelHeader, {
        title: props.selectedInstance.getModuleIdentifier()
    }), /*#__PURE__*/ React.createElement("div", {
        className: "p-4 flex flex-col rounded-lg shadow-md"
    }, props.modules.map((module)=>/*#__PURE__*/ React.createElement(ModuleSection, {
            key: module.getHeritage().join("\x00"),
            module: module,
            selectedInstance: props.selectedInstance,
            selectInstance: props.selectInstance,
            cardUpdateEnabled: props.cardUpdateEnabled
        }))));
};
const ModuleSection = (props)=>{
    const { module, selectedInstance } = props;
    const heritage = module.getHeritage().join("▶");
    return /*#__PURE__*/ React.createElement("div", {
        className: "mb-4"
    }, /*#__PURE__*/ React.createElement("h3", {
        className: "text-lg font-semibold mb-2 overflow-x-auto whitespace-nowrap"
    }, heritage), /*#__PURE__*/ React.createElement("ul", null, Array.from(module.instances).map(([version, inst])=>/*#__PURE__*/ React.createElement(ModuleInstance, {
            key: version,
            isSelected: inst === selectedInstance,
            moduleInstance: inst,
            selectInstance: props.selectInstance,
            cardUpdateEnabled: props.cardUpdateEnabled
        }))));
};
const ModuleInstance = (props)=>{
    return /*#__PURE__*/ React.createElement("li", {
        onClick: ()=>props.selectInstance(props.moduleInstance),
        className: classnames("p-2 rounded-md cursor-pointer flex items-center justify-between", props.isSelected ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200")
    }, /*#__PURE__*/ React.createElement(ScrollableText, null, /*#__PURE__*/ React.createElement("span", {
        className: "font-medium"
    }, props.moduleInstance.getVersion())), /*#__PURE__*/ React.createElement("div", {
        className: "flex items-center gap-2"
    }, /*#__PURE__*/ React.createElement(RAB, props), /*#__PURE__*/ React.createElement(DEB, props)));
};
const RAB = (props)=>{
    const { moduleInstance } = props;
    const isInstalled = React.useCallback(()=>"isInstalled" in moduleInstance && moduleInstance.isInstalled(), [
        moduleInstance
    ]);
    const [installed, setInstalled, updateInstalled] = useUpdate(isInstalled);
    const B = installed ? RemoveButton : AddButton;
    return /*#__PURE__*/ React.createElement(B, {
        ...props,
        setInstalled: setInstalled,
        updateInstalled: updateInstalled
    });
};
const RemoveButton = (props)=>{
    return /*#__PURE__*/ React.createElement("button", {
        onClick: async ()=>{
            props.setInstalled(false);
            if (!await props.moduleInstance.remove()) {
                props.updateInstalled();
            }
        },
        className: "px-2 py-1 text-xs font-semibold text-red-500 bg-red-100 rounded hover:bg-red-200"
    }, "del");
};
const AddButton = (props)=>{
    return /*#__PURE__*/ React.createElement("button", {
        onClick: async ()=>{
            props.setInstalled(true);
            if (!await props.moduleInstance.add()) {
                props.updateInstalled();
            }
        },
        className: "px-2 py-1 text-xs font-semibold text-green-500 bg-green-100 rounded hover:bg-green-200"
    }, "ins");
};
const DEB = (props)=>{
    const isEnabled = React.useCallback(()=>props.moduleInstance.isEnabled(), [
        props.moduleInstance
    ]);
    const [enabled, setEnabled, updateEnabled] = useUpdate(isEnabled);
    const B = enabled ? DisableButton : EnableButton;
    return /*#__PURE__*/ React.createElement(B, {
        ...props,
        setEnabled: (enabled)=>setEnabled(enabled),
        updateEnabled: updateEnabled,
        cardUpdateEnabled: props.cardUpdateEnabled
    });
};
const DisableButton = (props)=>{
    return /*#__PURE__*/ React.createElement("button", {
        onClick: async ()=>{
            props.setEnabled(false);
            if (await props.moduleInstance.getModule().disable()) {
                props.cardUpdateEnabled();
            } else {
                props.updateEnabled();
            }
        },
        className: "px-2 py-1 text-xs font-semibold text-yellow-500 bg-yellow-100 rounded hover:bg-yellow-200"
    }, "dis");
};
const EnableButton = (props)=>{
    return /*#__PURE__*/ React.createElement("button", {
        onClick: async ()=>{
            props.setEnabled(true);
            if (await props.moduleInstance.enable()) {
                props.cardUpdateEnabled();
            } else {
                props.updateEnabled();
            }
        },
        className: "px-2 py-1 text-xs font-semibold text-blue-500 bg-blue-100 rounded hover:bg-blue-200"
    }, "ena");
};
