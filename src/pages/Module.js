import { S } from "/modules/Delusoire/std/index.js";
const { React } = S;
import Button from "../components/Button/index.js";
import DownloadIcon from "../components/icons/DownloadIcon.js";
import LoadingIcon from "../components/icons/LoadingIcon.js";
import TrashIcon from "../components/icons/TrashIcon.js";
import { t } from "../i18n.js";
import { renderMarkdown } from "../api/github.js";
import { logger } from "../index.js";
import { Module, ModuleManager } from "/hooks/module.js";
import { fetchJSON } from "/hooks/util.js";
const RemoteMarkdown = React.memo(({ url }) => {
    const { status, error, data: markdown, } = S.ReactQuery.useQuery({
        queryKey: ["markdown", url],
        queryFn: () => fetch(url)
            .then(res => res.text())
            .then(markdown => renderMarkdown(markdown)),
    });
    switch (status) {
        case "pending": {
            return (S.React.createElement("footer", { className: "marketplace-footer" },
                S.React.createElement(LoadingIcon, null)));
        }
        case "success": {
            return S.React.createElement("div", { id: "marketplace-readme", className: "marketplace-readme__container", dangerouslySetInnerHTML: { __html: markdown } });
        }
        case "error": {
            logger.error(error);
            return "Something went wrong.";
        }
    }
});
// TODO: Disable removing local-only modules (remoteMeta = undefined), update the azkjgdh oizaj d
export default function ({ murl }) {
    const { data: metadata } = S.ReactQuery.useSuspenseQuery({
        queryKey: ["modulePage", murl],
        queryFn: () => fetchJSON(murl),
    });
    const identifier = `${metadata.authors[0]}/${metadata.name}`;
    const module = Module.registry.get(identifier);
    const installed = module !== undefined;
    const label = t(installed ? "remove" : "install");
    const readmeURL = murl.replace(/metadata\.json$/, "README.md");
    return (S.React.createElement("section", { className: "contentSpacing" },
        S.React.createElement("div", { className: "marketplace-header" },
            S.React.createElement("div", { className: "marketplace-header__left" },
                S.React.createElement("h1", null, t("readmePage.title"))),
            S.React.createElement("div", { className: "marketplace-header__right" },
                S.React.createElement(Button, { className: "marketplace-header__button", onClick: e => {
                        e.preventDefault();
                        if (installed) {
                            ModuleManager.remove(identifier);
                        }
                        else {
                            ModuleManager.add(murl);
                        }
                    }, label: label },
                    installed ? S.React.createElement(TrashIcon, null) : S.React.createElement(DownloadIcon, null),
                    " ",
                    label)))
    // TODO: replace with github's get markdown api call
    ,
        "// TODO: replace with github's get markdown api call",
        S.React.createElement(RemoteMarkdown, { url: readmeURL })));
}
