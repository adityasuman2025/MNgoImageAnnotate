import type { Annotation, AnnotationData, AnnotationId } from "./types";

type Callback = () => void;
type ActiveToolName = string | null;

interface GlobalState {
    annotationData: AnnotationData,
    activeToolName: ActiveToolName,
}
const state: GlobalState = {
    annotationData: {
        annotationIds: [],
        annotations: {},
        highestZIndex: 0,
    },
    activeToolName: null
};

const activeToolNameSubscribers = new Set<Callback>(); // will be used to track change in activeToolName -> will be used in ToolBar comp
const annotationIdsSubscribers = new Set<Callback>(); // will be used to track addition/removal of any annotion Element -> will be used in Ground comp
const annotationByIdSubscribers = new Map<AnnotationId, Set<Callback>>(); // will be used to track change any specific annotation Element by its id -> will be used in Element comp
const annotationDataSubscribers = new Set<Callback>(); // will be used to track any single change on annotationData (addition/removal/updation) -> will be used for onChange prop of MNgoImageAnnotate comp

const globalStore = {
    // for active tool name
    getActiveToolName(): ActiveToolName {
        return state.activeToolName;
    },
    setActiveToolName(arg: ActiveToolName | ((prev: ActiveToolName) => ActiveToolName)) {
        const next = typeof arg === "function" ? arg(state.activeToolName) : arg;
        if (next === state.activeToolName) return;

        state.activeToolName = next

        activeToolNameSubscribers.forEach(cb => cb());
    },
    subscribeToActiveToolName(cb: Callback) {
        activeToolNameSubscribers.add(cb);

        return () => activeToolNameSubscribers.delete(cb);
    },


    // for getting list of all annotations (will be used in Ground comp)
    getAllAnnotationIds(): AnnotationId[] {
        return state?.annotationData?.annotationIds;
    },
    subscribeToAnnotationIds(cb: Callback) {
        annotationIdsSubscribers.add(cb);

        return () => annotationIdsSubscribers.delete(cb);
    },


    // for getting complete annotation data (will be used in MNgoImageAnnotate comp)
    getAnnotationData(): AnnotationData {
        return state?.annotationData;
    },
    setAnnotationData: function (annotationData: AnnotationData) {
        if (!annotationData || state.annotationData === annotationData) return;

        const highestZIndex = annotationData.highestZIndex ?? Math.max(0, ...Object.values(annotationData.annotations || {}).map(a => a.zIndex || 0));

        state.annotationData = { ...annotationData, highestZIndex };

        annotationByIdSubscribers.forEach((val, key) => val.forEach(cb => cb()));
        annotationIdsSubscribers.forEach(cb => cb());
        annotationDataSubscribers.forEach(cb => cb());
    },
    clearAnnotationData() {
        if (state.annotationData.annotationIds.length === 0) return;

        state.annotationData = {
            annotations: {},
            annotationIds: [],
            highestZIndex: 0,
        };

        annotationByIdSubscribers.forEach((val) => val.forEach(cb => cb()));
        annotationByIdSubscribers.clear();
        annotationIdsSubscribers.forEach(cb => cb());
        annotationDataSubscribers.forEach(cb => cb());
    },
    subscribeToAnnotationData(cb: Callback) {
        annotationDataSubscribers.add(cb);

        return () => annotationDataSubscribers.delete(cb);
    },


    // for getting data of a specific annotation by its id (will be used in Element comp)
    getAnnotationById(id: AnnotationId): Annotation | undefined {
        return state?.annotationData?.annotations?.[id];
    },
    updateAnnotationById(id: AnnotationId, data: Annotation) {
        const isNew = !Object.hasOwn(state.annotationData.annotations, id);

        const annotations = { ...state.annotationData.annotations, [id]: data };
        const annotationIds = isNew ? [...state.annotationData.annotationIds, id] : state.annotationData.annotationIds;

        state.annotationData = {
            ...state.annotationData,
            annotations,
            annotationIds
        }

        annotationByIdSubscribers.get(id)?.forEach(cb => cb());  // notify fine-grained listeners (Element component) for this specific annotation
        if (isNew) annotationIdsSubscribers.forEach(cb => cb());
        annotationDataSubscribers.forEach(cb => cb());
    },
    removeAnnotationById(id: AnnotationId) {
        if (!Object.hasOwn(state.annotationData.annotations, id)) return;

        const { [id]: _, ...rest } = state.annotationData.annotations;

        state.annotationData = {
            ...state.annotationData,
            annotations: rest,
            annotationIds: state.annotationData.annotationIds.filter(currId => currId !== id)
        }

        annotationByIdSubscribers.delete(id);
        annotationIdsSubscribers.forEach(cb => cb());
        annotationDataSubscribers.forEach(cb => cb());
    },
    subscribeToAnnotationById(id: AnnotationId, cb: Callback) {
        if (!annotationByIdSubscribers.has(id)) annotationByIdSubscribers.set(id, new Set());

        const thisIdSet = annotationByIdSubscribers.get(id)!;
        thisIdSet?.add(cb);

        return () => {
            thisIdSet?.delete(cb);

            if (thisIdSet.size === 0) annotationByIdSubscribers.delete(id);
        };
    },

    // for tracking and managing the highest stacking order (zIndex) of elements
    getHighestZIndex(): number {
        return state.annotationData.highestZIndex;
    },
    setHighestZIndex(zIndex: number) {
        state.annotationData.highestZIndex = zIndex;
    },
}

export default globalStore;