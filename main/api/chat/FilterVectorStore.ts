import {
  BaseEmbedding,
  BaseNode,
  DEFAULT_PERSIST_DIR,
  exists,
  getTopKEmbeddings,
  getTopKEmbeddingsLearner,
  getTopKMMREmbeddings,
  IEmbedModel,
  SimpleVectorStore,
  VectorStoreBase,
  VectorStoreNoEmbedModel,
  VectorStoreQuery,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
} from "llamaindex";
import path from "path";
import fs from "fs/promises";

const LEARNER_MODES = new Set<VectorStoreQueryMode>([
  VectorStoreQueryMode.SVM,
  VectorStoreQueryMode.LINEAR_REGRESSION,
  VectorStoreQueryMode.LOGISTIC_REGRESSION,
]);

const MMR_MODE = VectorStoreQueryMode.MMR;

class SimpleVectorStoreData {
  embeddingDict: Record<string, number[]> = {};
  textIdToRefDocId: Record<string, string> = {};
  textIdToMetadata: Record<string, Record<string, any>> = {};
}

export class FilterVectorStore
  extends VectorStoreBase
  implements VectorStoreNoEmbedModel
{
  storesText: boolean = false;
  private data: SimpleVectorStoreData;
  private persistPath: string | undefined;

  constructor(init?: { data?: SimpleVectorStoreData } & Partial<IEmbedModel>) {
    super(init?.embedModel);
    this.data = init?.data || new SimpleVectorStoreData();
  }

  static async fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR,
    embedModel?: BaseEmbedding,
  ): Promise<FilterVectorStore> {
    const persistPath = path.join(persistDir, "vector_store.json");
    return await FilterVectorStore.fromPersistPath(persistPath, embedModel);
  }

  get client(): any {
    return null;
  }

  async get(textId: string): Promise<number[]> {
    return this.data.embeddingDict[textId];
  }

  async add(embeddingResults: BaseNode[]): Promise<string[]> {
    for (const node of embeddingResults) {
      this.data.embeddingDict[node.id_] = node.getEmbedding();
      this.data.textIdToMetadata[node.id_] = node.metadata;

      if (!node.sourceNode) {
        continue;
      }

      this.data.textIdToRefDocId[node.id_] = node.sourceNode?.nodeId;
    }

    if (this.persistPath) {
      await this.persist(this.persistPath);
    }

    return embeddingResults.map((result) => result.id_);
  }

  async delete(refDocId: string): Promise<void> {
    const textIdsToDelete = Object.keys(this.data.textIdToRefDocId).filter(
      (textId) => this.data.textIdToRefDocId[textId] === refDocId,
    );
    for (const textId of textIdsToDelete) {
      delete this.data.embeddingDict[textId];
      delete this.data.textIdToRefDocId[textId];
    }
    if (this.persistPath) {
      await this.persist(this.persistPath);
    }
    return Promise.resolve();
  }

  async query(query: VectorStoreQuery): Promise<VectorStoreQueryResult> {
    let nodeIds: string[], embeddings: number[][];
    const items = Object.entries(this.data.embeddingDict);
    console.log("filters", query.filters);
    if (query.docIds) {
      const availableIds = new Set(query.docIds);
      const queriedItems = items.filter((item) => availableIds.has(item[0]));
      nodeIds = queriedItems.map((item) => item[0]);
      embeddings = queriedItems.map((item) => item[1]);
    } else if (!(query.filters == null) && query.filters.filters.length > 0) {
      // Filter the items based on the metadata
      const availableIds = new Set(
        Object.entries(this.data.textIdToMetadata)
          .filter(([id, metadata]) => {
            return query.filters.filters.some((filter) => {
              return metadata[filter.key] === filter.value;
            });
          })
          .map(([id, metadata]) => id),
      );
      console.log("availableIds", availableIds);
      const queriedItems = items.filter((item) => availableIds.has(item[0]));
      nodeIds = queriedItems.map((item) => item[0]);
      embeddings = queriedItems.map((item) => item[1]);
    } else {
      // No docIds specified, so use all available items
      nodeIds = items.map((item) => item[0]);
      embeddings = items.map((item) => item[1]);
    }

    const queryEmbedding = query.queryEmbedding!;

    let topSimilarities: number[], topIds: string[];
    if (LEARNER_MODES.has(query.mode)) {
      [topSimilarities, topIds] = getTopKEmbeddingsLearner(
        queryEmbedding,
        embeddings,
        query.similarityTopK,
        nodeIds,
      );
    } else if (query.mode === MMR_MODE) {
      const mmrThreshold = query.mmrThreshold;
      [topSimilarities, topIds] = getTopKMMREmbeddings(
        queryEmbedding,
        embeddings,
        null,
        query.similarityTopK,
        nodeIds,
        mmrThreshold,
      );
    } else if (query.mode === VectorStoreQueryMode.DEFAULT) {
      [topSimilarities, topIds] = getTopKEmbeddings(
        queryEmbedding,
        embeddings,
        query.similarityTopK,
        nodeIds,
      );
    } else {
      throw new Error(`Invalid query mode: ${query.mode}`);
    }

    return Promise.resolve({
      similarities: topSimilarities,
      ids: topIds,
    });
  }

  async persist(
    persistPath: string = path.join(DEFAULT_PERSIST_DIR, "vector_store.json"),
  ): Promise<void> {
    await FilterVectorStore.persistData(persistPath, this.data);
  }

  protected static async persistData(
    persistPath: string,
    data: SimpleVectorStoreData,
  ): Promise<void> {
    const dirPath = path.dirname(persistPath);
    if (!(await exists(dirPath))) {
      await fs.mkdir(dirPath);
    }

    await fs.writeFile(persistPath, JSON.stringify(data));
  }

  static async fromPersistPath(
    persistPath: string,
    embedModel?: BaseEmbedding,
  ): Promise<FilterVectorStore> {
    const dirPath = path.dirname(persistPath);
    if (!(await exists(dirPath))) {
      await fs.mkdir(dirPath, { recursive: true });
    }

    let dataDict: any = {};
    try {
      const fileData = await fs.readFile(persistPath);
      dataDict = JSON.parse(fileData.toString());
    } catch (e) {
      console.error(
        `No valid data found at path: ${persistPath} starting new store.`,
      );
      // persist empty data, to ignore this error in the future
      await FilterVectorStore.persistData(
        persistPath,
        new SimpleVectorStoreData(),
      );
    }

    const data = new SimpleVectorStoreData();
    data.embeddingDict = dataDict.embeddingDict ?? {};
    data.textIdToRefDocId = dataDict.textIdToRefDocId ?? {};
    data.textIdToMetadata = dataDict.textIdToMetadata ?? {};
    const store = new FilterVectorStore({ data, embedModel });
    store.persistPath = persistPath;
    return store;
  }

  static fromDict(
    saveDict: SimpleVectorStoreData,
    embedModel?: BaseEmbedding,
  ): FilterVectorStore {
    const data = new SimpleVectorStoreData();
    data.embeddingDict = saveDict.embeddingDict;
    data.textIdToRefDocId = saveDict.textIdToRefDocId;
    data.textIdToMetadata = saveDict.textIdToMetadata;
    return new FilterVectorStore({ data, embedModel });
  }

  toDict(): SimpleVectorStoreData {
    return {
      embeddingDict: this.data.embeddingDict,
      textIdToRefDocId: this.data.textIdToRefDocId,
      textIdToMetadata: this.data.textIdToMetadata,
    };
  }
}
