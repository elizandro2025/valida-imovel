/**
 * Conferência de projeto aberta nesta aba, só na memória: some ao recarregar a página, ao fechar a aba e ao sair da
 * conta. Nada vai para o navegador (localStorage) nem para o servidor, a mesma regra das análises de matrícula.
 * Fica num módulo próprio e pequeno para o AuthContext limpar ao sair sem carregar o código da conferência.
 */
import type { ProjectData } from './projectConferenceService';
import type { ProjectUploadFile } from './projectAiService';

let project: ProjectData | null = null;
// Arquivos escolhidos para a leitura com IA (sobrevivem à troca de aba e chegam do Hub)
let files: ProjectUploadFile[] = [];

export const projectMemory = {
  getProject: (): ProjectData | null => project,
  setProject: (next: ProjectData): void => { project = next; },
  getFiles: (): ProjectUploadFile[] => files,
  setFiles: (next: ProjectUploadFile[]): void => { files = next; },
  clear: (): void => { project = null; files = []; },
};
