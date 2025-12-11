import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `O módulo nativo SafraPay não foi encontrado.

Certifique-se de que:
  • Você rodou 'gradlew :app:assembleDebug' ou 'npx react-native run-android'
  • O arquivo SafraPayModule.java está no package 'br.com.versati.versapos.mobile'
  • Você adicionou 'packages.add(new SafraPayPackage());' no MainApplication.java
`;

// Tipos do módulo nativo expostos pelo Java
export interface SafraTransactionResult {
  /** Código de retorno bruto da Safra (1 = aprovada, 3 = estornada, etc.) */
  resultado: number;
  /** Nome da operação realizada (VENDA_CREDITO_A_VISTA, VENDA_DEBITO_A_VISTA, etc.) */
  operacao: string;
  /** String completa do SaidaTransacao.toString() – para log / análise */
  raw: string;
  /** true se consideramos sucesso (aprovada, estornada ou RESULT_OK) */
  sucesso: boolean;
}

export interface SafraTerminalData {
  cnpj: string;
  ec: string;
  numSerie: string;
  numeroLogico: string;
  versaoSafrapay: string;
}

export type SafraPrintAlign = 'left' | 'center' | 'right';
export type SafraPrintSize =
  | 'extra_small'
  | 'small'
  | 'medium'
  | 'large'
  | 'extra_large';
export type SafraPrintStyle = 'normal' | 'bold' | 'invert' | 'italic';

export interface SafraPrintLine {
  /** tipo da linha: 'text' (padrão) ou 'blank' (linha em branco) */
  type?: 'text' | 'blank';
  /** conteúdo da linha (se type = 'text') */
  content?: string;
  /** alinhamento: left/center/right (default: left) */
  align?: SafraPrintAlign;
  /** tamanho da fonte (default: medium) */
  size?: SafraPrintSize;
  /** estilo: normal, bold ou invert (default: normal) */
  style?: SafraPrintStyle;
}


export interface SafraUpdateStatus {
  status: 'updating' | 'already_updated';
}

export interface SafraNFCBlock {
  blockNumber: number;
  /** dados em hex */
  data: string;
}

type SafraPayNativeType = {
  // vendas
  vendaCreditoAVista(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;
  vendaCreditoParcSemJuros(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;
  vendaCreditoParcComJuros(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;
  vendaDebitoAVista(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;
  vendaVoucher(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;
  vendaQrcode(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;
  vendaPIX(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;

  // pré-autorização
  preAutorizacaoSolicita(amountInCents: number, orderId: string): Promise<SafraTransactionResult>;
  preAutorizacaoConfirma(
    amountInCents: number,
    nsu: string,
    orderId: string,
  ): Promise<SafraTransactionResult>;
  preAutorizacaoCancela(
    amountInCents: number,
    nsu: string,
    orderId: string,
  ): Promise<SafraTransactionResult>;

  // cancelamento / devolução pix
  cancelamentoPorNSU(nsu: string, orderId: string): Promise<SafraTransactionResult>;
  devolucaoPIX(orderId: string): Promise<SafraTransactionResult>;

  // relatório / reimpressão
  reimpressaoComprovantesUltimosDias(dias: number, orderId: string): Promise<SafraTransactionResult>;
  relatorioUltimosDias(dias: number, orderId: string): Promise<SafraTransactionResult>;
  reimpressaoTransacaoPeloNSU(nsu: string, orderId: string): Promise<SafraTransactionResult>;

  // dados terminal / busca transação / exclusividade / update app
  obterDadosTerminal(): Promise<SafraTerminalData>;
  obterTransacaoPeloID(idTransacao: string): Promise<SafraTransactionResult>;
  solicitarVendaExclusiva(habilitar: boolean): Promise<null>;
  verificaAtualizacaoSafrapay(): Promise<SafraUpdateStatus>;

  // impressora
  imprimirCupom(jsonLines: string): Promise<string>;
  impressaoLivre(): Promise<string>; // "OK" ou erro via exception
  testeStressImpressao(max: number): Promise<{
    tentativas: number;
    sucessos: number;
    erros: number;
  }>;
  retentarImpressaoAposErro(): Promise<string>;
  limparBufferImpressao(): Promise<string>;

  // NFC
  lerNFC(): Promise<SafraNFCBlock[]>;
  escreverNFC(hexPayload?: string): Promise<string>;
};

const SafraPay: SafraPayNativeType =
  (NativeModules.SafraPay as SafraPayNativeType) ?? (new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    },
  ) as any);

function ensureAndroid() {
  if (Platform.OS !== 'android') {
    throw new Error('SafraPay só está disponível no Android.');
  }
}

function toCents(valorReais: number): number {
  // garante sempre centavos inteiros
  return Math.round((valorReais || 0) * 100);
}

/**
 * Wrapper alto nível – venda crédito à vista
 */
export async function vendaCreditoSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.vendaCreditoAVista(amount, orderId);
}

/**
 * Wrapper alto nível – venda débito à vista
 */
export async function vendaDebitoSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.vendaDebitoAVista(amount, orderId);
}

/**
 * Crédito parcelado sem juros
 */
export async function vendaCreditoParcSemJurosSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.vendaCreditoParcSemJuros(amount, orderId);
}

/**
 * Crédito parcelado com juros
 */
export async function vendaCreditoParcComJurosSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.vendaCreditoParcComJuros(amount, orderId);
}

/**
 * Venda PIX via Safra
 */
export async function vendaPixSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.vendaPIX(amount, orderId);
}

/**
 * Venda QRCode (menu do terminal escolhe sub-modo)
 */
export async function vendaQRCodeSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.vendaQrcode(amount, orderId);
}

/**
 * Venda Voucher
 */
export async function vendaVoucherSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.vendaVoucher(amount, orderId);
}

/**
 * PRÉ-AUTORIZAÇÃO – solicitar
 */
export async function preAutorizacaoSolicitaSafra(
  valorReais: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.preAutorizacaoSolicita(amount, orderId);
}

/**
 * PRÉ-AUTORIZAÇÃO – confirmar (precisa do NSU)
 */
export async function preAutorizacaoConfirmaSafra(
  valorReais: number,
  nsu: string,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.preAutorizacaoConfirma(amount, nsu, orderId);
}

/**
 * PRÉ-AUTORIZAÇÃO – cancelar (precisa do NSU)
 */
export async function preAutorizacaoCancelaSafra(
  valorReais: number,
  nsu: string,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  const amount = toCents(valorReais);
  return SafraPay.preAutorizacaoCancela(amount, nsu, orderId);
}

/**
 * Cancelamento por NSU (estorno da venda)
 */
export async function cancelamentoPorNSUSafra(
  nsu: string,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  return SafraPay.cancelamentoPorNSU(nsu, orderId);
}

/**
 * Devolução PIX
 */
export async function devolucaoPixSafra(orderId: string): Promise<SafraTransactionResult> {
  ensureAndroid();
  return SafraPay.devolucaoPIX(orderId);
}

/**
 * Reimpressão de comprovantes – últimos X dias
 */
export async function reimpressaoComprovantesSafra(
  dias: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  return SafraPay.reimpressaoComprovantesUltimosDias(dias, orderId);
}

/**
 * Relatório – últimos X dias
 */
export async function relatorioSafra(
  dias: number,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  return SafraPay.relatorioUltimosDias(dias, orderId);
}

/**
 * Reimpressão de transação via NSU
 */
export async function reimpressaoPorNSUSafra(
  nsu: string,
  orderId: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  return SafraPay.reimpressaoTransacaoPeloNSU(nsu, orderId);
}

/**
 * Dados do terminal (cnpj, ec, nº série, etc.)
 */
export async function obterDadosTerminalSafra(): Promise<SafraTerminalData> {
  ensureAndroid();
  return SafraPay.obterDadosTerminal();
}

/**
 * Buscar transação pelo ID (idTransacao)
 */
export async function obterTransacaoPorIdSafra(
  idTransacao: string,
): Promise<SafraTransactionResult> {
  ensureAndroid();
  return SafraPay.obterTransacaoPeloID(idTransacao);
}

/**
 * Solicitar / cancelar venda exclusiva (app padrão Safra)
 */
export async function solicitarVendaExclusivaSafra(habilitar: boolean): Promise<void> {
  ensureAndroid();
  await SafraPay.solicitarVendaExclusiva(habilitar);
}

/**
 * Verificar atualização do app SafraPay
 */
export async function verificarAtualizacaoSafra(): Promise<SafraUpdateStatus> {
  ensureAndroid();
  return SafraPay.verificaAtualizacaoSafrapay();
}

/**
 * Impressão livre de teste (usa layout fixo do módulo nativo)
 */
export async function impressaoLivreSafra(): Promise<void> {
  ensureAndroid();
  await SafraPay.impressaoLivre();
}

/**
 * Impressão de cupom customizado no SafraPay.
 * Recebe um array de linhas (SafraPrintLine) e converte para JSON.
 */
export async function imprimirCupomSafra(
  linhas: SafraPrintLine[],
): Promise<void> {
  ensureAndroid();
  const payload = JSON.stringify(linhas ?? []);
  await SafraPay.imprimirCupom(payload);
}


/**
 * Teste de stress da impressora
 */
export async function testeStressImpressaoSafra(
  maxTentativas: number,
): Promise<{ tentativas: number; sucessos: number; erros: number }> {
  ensureAndroid();
  return SafraPay.testeStressImpressao(maxTentativas);
}

/**
 * Reimprimir após erro de papel
 */
export async function retentarImpressaoAposErroSafra(): Promise<void> {
  ensureAndroid();
  await SafraPay.retentarImpressaoAposErro();
}

/**
 * Limpar buffer de impressão
 */
export async function limparBufferImpressaoSafra(): Promise<void> {
  ensureAndroid();
  await SafraPay.limparBufferImpressao();
}

/**
 * Ler NFC Mifare – retorna lista de blocos
 */
export async function lerNFCSafra(): Promise<SafraNFCBlock[]> {
  ensureAndroid();
  return SafraPay.lerNFC();
}

/**
 * Escrever NFC Mifare – payload em hex (opcional, usa payload de exemplo se vazio)
 */
export async function escreverNFCSafra(hexPayload?: string): Promise<void> {
  ensureAndroid();
  await SafraPay.escreverNFC(hexPayload);
}
