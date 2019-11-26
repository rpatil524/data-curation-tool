import { FileSource, Sheet } from '@/common/file-source';

const fileSource = {
  namespaced: true,
  state: {
    fileSourceList: [],
    currentFile: null,
    selectedElements: []
  },
  getters: {
    sourceList: state => state.fileSourceList,
    currentFile: state => state.currentFile,
    sheets: state => state.currentFile?.sheets || [],
    currentSheet: state => state.currentFile?.currentSheet,
    selectedElements: state => state.selectedElements || [],
    fileByPath : state => filePath => state.fileSourceList.find(file => file.path === filePath)
  },
  mutations: {
    updateSourceList (state, sourceList: FileSource[]) {
      state.fileSourceList = sourceList
    },
    setCurrentFile (state, file: FileSource) {
      state.currentFile = state.fileSourceList.find(f => f.path === file.path) || null
    },
    setSheets (state, sheets: string[]) {
      if (state.currentFile) {
        const tmpSheet: Sheet[] = []
        for (const sheetName of sheets) {
          tmpSheet.push(new Sheet(sheetName))
        }
        state.currentFile.sheets = tmpSheet

        // Update current sheet according to new list
        state.currentFile.currentSheet = tmpSheet.find(s => s.value === state.currentFile?.currentSheet?.value) || null
      }
    },
    setCurrentSheet (state, sheet: Sheet | null) {
      if (state.currentFile) {
        state.currentFile.currentSheet = sheet
      }
    },
    addFile (state, filePath: string) {
      if (!state.fileSourceList.find(file => file.path === filePath)) {
        state.fileSourceList.push(new FileSource(filePath))
      }
    },
    setSelectedElements (state, list) {
      state.selectedElements = list
    }
  },
  actions: {}
}

export default fileSource
