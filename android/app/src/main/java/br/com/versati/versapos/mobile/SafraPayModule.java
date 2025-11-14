package br.com.versati.versapos.mobile;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import br.com.setis.safra.integracaosafra.Gerenciador;
import br.com.setis.safra.integracaosafra.PrinterIntegracao;
import br.com.setis.safra.integracaosafra.entidades.DadosAutomacao;
import br.com.setis.safra.integracaosafra.entidades.DadosSubAdquirente;
import br.com.setis.safra.integracaosafra.entidades.DadosTerminal;
import br.com.setis.safra.integracaosafra.entidades.EntradaTransacao;
import br.com.setis.safra.integracaosafra.entidades.MifareBlockData;
import br.com.setis.safra.integracaosafra.entidades.ModoImpressaoAutomatico;
import br.com.setis.safra.integracaosafra.entidades.NFCRequest;
import br.com.setis.safra.integracaosafra.entidades.Operacoes;
import br.com.setis.safra.integracaosafra.entidades.RequestApi;
import br.com.setis.safra.integracaosafra.entidades.SaidaTransacao;
import br.com.setis.safra.integracaosafra.listeners.DadosTerminalCallback;
import br.com.setis.safra.integracaosafra.listeners.MifareNFCCallback;
import br.com.setis.safra.integracaosafra.listeners.PrinterListener;
import br.com.setis.safra.integracaosafra.listeners.TransacaoListenerCallback;
import br.com.setis.safra.integracaosafra.listeners.TransactionSearchCallback;
import br.com.setis.safra.integracaosafra.listeners.UpdateVersionCallback;
import br.com.setis.safra.integracaosafra.printer.PrinterStatus;
import br.com.setis.safra.integracaosafra.printer.PrinterTextAlignment;
import br.com.setis.safra.integracaosafra.printer.PrinterTextSize;
import br.com.setis.safra.integracaosafra.printer.PrinterTextStyle;
import br.com.setis.safra.integracaosafra.util.ReturnCodes;

/**
 * Módulo nativo SafraPay para React Native.
 */
public class SafraPayModule extends ReactContextBaseJavaModule {

    private static final String TAG = "SafraPayModule";

    private Gerenciador gerenciador;

    public SafraPayModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "SafraPay";
    }

    /**
     * Garante um Gerenciador sempre com uma Activity válida.
     */
    private synchronized Gerenciador getGerenciador() {
        if (gerenciador == null) {
            DadosAutomacao dadosAutomacao =
                    new DadosAutomacao("VersaTI", "VersaPOSSafra", "1.0");

            Activity activity = getCurrentActivity();
            if (activity == null) {
                throw new IllegalStateException(
                        "SafraPay: Activity atual está nula. " +
                        "Chame as funções do módulo após a tela estar montada (por ex, a partir de um botão).");
            }

            gerenciador = new Gerenciador(activity, dadosAutomacao);
        }
        return gerenciador;
    }

    /**
     * Converte SaidaTransacao em map para o JS.
     */
    private WritableMap mapSaidaTransacao(SaidaTransacao saidaTransacao) {
        WritableMap result = Arguments.createMap();

        int resultado = saidaTransacao.obtemResultadoTransacao();

        result.putInt("resultado", resultado);
        result.putString("operacao", saidaTransacao.obtemOperacaoRealizada().name());
        result.putString("raw", saidaTransacao.toString());

        boolean sucesso =
                (resultado == ReturnCodes.RESULT_APROVADA
                        || resultado == ReturnCodes.RESULT_ESTORNADA
                        || resultado == ReturnCodes.RESULT_OK);

        result.putBoolean("sucesso", sucesso);

        return result;
    }

    /**
     * Envia RequestApi genérica usando modo de impressão default.
     */
    private void enviaTransacao(final RequestApi requestApi, final Promise promise) {
        ModoImpressaoAutomatico modo = ModoImpressaoAutomatico.USUARIO_ESCOLHE;
        requestApi.setModoImpressao(modo);

        // Exemplo de sub-adquirente (opcional)
        // DadosSubAdquirente dadosSub = new DadosSubAdquirente();
        // ... (preencher se for usar)
        // requestApi.setDadosSubAdquirente(dadosSub);

        getGerenciador().realizaTransacao(requestApi, new TransacaoListenerCallback() {
            @Override
            public void transacaoFinalizada(SaidaTransacao saidaTransacao) {
                promise.resolve(mapSaidaTransacao(saidaTransacao));
            }

            @Override
            public void transacaoException(Exception e) {
                Log.e(TAG, "transacaoException", e);
                promise.reject("SAFRA_TRANSACAO_EXCEPTION", e);
            }
        });
    }

    private String novoIdTransacao(String orderId) {
        if (orderId == null || orderId.isEmpty()) {
            return UUID.randomUUID().toString();
        }
        return orderId;
    }

    // ---------------------------------------------------------------------
    // VENDAS
    // ---------------------------------------------------------------------

    @ReactMethod
    public void vendaCreditoAVista(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.VENDA_CREDITO_A_VISTA,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void vendaCreditoParcSemJuros(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.VENDA_CREDITO_PARC_SEM_JUROS,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void vendaCreditoParcComJuros(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.VENDA_CREDITO_PARC_COM_JUROS,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void vendaDebitoAVista(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.VENDA_DEBITO_A_VISTA,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void vendaVoucher(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.VENDA_VOUCHER,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void vendaQrcode(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.VENDA_QRCODE,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void vendaPIX(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.VENDA_PIX,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    // ---------------------------------------------------------------------
    // PRÉ-AUTORIZAÇÃO
    // ---------------------------------------------------------------------

    @ReactMethod
    public void preAutorizacaoSolicita(int amountInCents, String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.PRE_AUTORIZACAO_SOLICITA,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void preAutorizacaoConfirma(int amountInCents, String nsu, String orderId, Promise promise) {
        if (nsu == null || nsu.isEmpty()) {
            promise.reject("SAFRA_PARAM", "NSU é obrigatório para confirmar pré-autorização");
            return;
        }

        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.PRE_AUTORIZACAO_CONFIRM,
                idTx
        );
        entrada.setNsuTransacao(nsu);

        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void preAutorizacaoCancela(int amountInCents, String nsu, String orderId, Promise promise) {
        if (nsu == null || nsu.isEmpty()) {
            promise.reject("SAFRA_PARAM", "NSU é obrigatório para cancelar pré-autorização");
            return;
        }

        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                amountInCents,
                Operacoes.PRE_AUTORIZACAO_CANCEL,
                idTx
        );
        entrada.setNsuTransacao(nsu);

        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    // ---------------------------------------------------------------------
    // CANCELAMENTO / DEVOLUÇÃO PIX
    // ---------------------------------------------------------------------

    @ReactMethod
    public void cancelamentoPorNSU(String nsu, String orderId, Promise promise) {
        if (nsu == null || nsu.isEmpty()) {
            promise.reject("SAFRA_PARAM", "NSU é obrigatório para cancelamento");
            return;
        }

        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                nsu,
                Operacoes.CANCELAMENTO_VIA_NSU,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void devolucaoPIX(String orderId, Promise promise) {
        String idTx = novoIdTransacao(orderId);
        EntradaTransacao entrada = new EntradaTransacao(
                Operacoes.DEVOLUCAO_PIX,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    // ---------------------------------------------------------------------
    // RELATÓRIO / REIMPRESSÃO
    // ---------------------------------------------------------------------

    @ReactMethod
    public void reimpressaoComprovantesUltimosDias(int dias, String orderId, Promise promise) {
        if (dias <= 0) dias = 2;
        String idTx = novoIdTransacao(orderId);

        Calendar dataInicial = Calendar.getInstance();
        dataInicial.add(Calendar.DAY_OF_YEAR, -dias);

        EntradaTransacao entrada = new EntradaTransacao(
                Operacoes.REIMPRESSAO,
                idTx
        );
        entrada.setDataInicialRelatorioOuReimpressao(dataInicial.getTime());
        entrada.setDataFinalRelatorioOuReimpressao(new Date());

        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void relatorioUltimosDias(int dias, String orderId, Promise promise) {
        if (dias <= 0) dias = 2;
        String idTx = novoIdTransacao(orderId);

        Calendar dataInicial = Calendar.getInstance();
        dataInicial.add(Calendar.DAY_OF_YEAR, -dias);

        EntradaTransacao entrada = new EntradaTransacao(
                Operacoes.RELATORIO,
                idTx
        );
        entrada.setDataInicialRelatorioOuReimpressao(dataInicial.getTime());
        entrada.setDataFinalRelatorioOuReimpressao(new Date());

        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    @ReactMethod
    public void reimpressaoTransacaoPeloNSU(String nsu, String orderId, Promise promise) {
        if (nsu == null || nsu.isEmpty()) {
            promise.reject("SAFRA_PARAM", "NSU é obrigatório para reimpressão por NSU");
            return;
        }

        String idTx = novoIdTransacao(orderId);

        EntradaTransacao entrada = new EntradaTransacao(
                nsu,
                Operacoes.REIMPRESSAO_VIA_CODIGO_NSU,
                idTx
        );
        RequestApi requestApi = new RequestApi(entrada);
        enviaTransacao(requestApi, promise);
    }

    // ---------------------------------------------------------------------
    // DADOS DO TERMINAL / BUSCAR TRANSAÇÃO / EXCLUSIVA / UPDATE
    // ---------------------------------------------------------------------

    @ReactMethod
    public void obterDadosTerminal(final Promise promise) {
        getGerenciador().requestDadosTerminal(new DadosTerminalCallback() {
            @Override
            public void onSuccess(DadosTerminal dadosTerminal) {
                WritableMap map = Arguments.createMap();
                map.putString("cnpj", dadosTerminal.getCnpj());
                map.putString("ec", dadosTerminal.getEc());
                map.putString("numSerie", dadosTerminal.getNumSerie());
                map.putString("numeroLogico", dadosTerminal.getNumeroLogico());
                map.putString("versaoSafrapay", dadosTerminal.getVersaoAtual());
                promise.resolve(map);
            }

            @Override
            public void onError(int errorCode) {
                promise.reject("SAFRA_DADOS_TERMINAL_ERRO",
                        "Terminal não está ativado! erro: " + errorCode);
            }
        });
    }

    @ReactMethod
    public void obterTransacaoPeloID(String idTransacao, final Promise promise) {
        try {
            getGerenciador().findTransactionFromId(idTransacao, new TransactionSearchCallback() {
                @Override
                public void onSuccess(SaidaTransacao saidaTransacao) {
                    promise.resolve(mapSaidaTransacao(saidaTransacao));
                }

                @Override
                public void onError(int errorCode) {
                    promise.reject("SAFRA_BUSCA_TRANSACAO_ERRO",
                            "Problema ao buscar a transação! erro: " + errorCode);
                }
            });
        } catch (IllegalArgumentException e) {
            promise.reject("SAFRA_PARAM", "Parâmetro inválido: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void solicitarVendaExclusiva(boolean habilitar, Promise promise) {
        getGerenciador().requestExclusiveSale(habilitar);
        promise.resolve(null);
    }

    @ReactMethod
    public void verificaAtualizacaoSafrapay(final Promise promise) {
        getGerenciador().updateVersion(new UpdateVersionCallback() {
            @Override
            public void onUpdating() {
                WritableMap map = Arguments.createMap();
                map.putString("status", "updating");
                promise.resolve(map);
            }

            @Override
            public void onVersionAlreadyUpdated() {
                WritableMap map = Arguments.createMap();
                map.putString("status", "already_updated");
                promise.resolve(map);
            }

            @Override
            public void onError(int errorCode) {
                promise.reject("SAFRA_UPDATE_ERRO",
                        "Erro ao verificar atualização [" + errorCode + "]");
            }
        });
    }

    // ---------------------------------------------------------------------
    // IMPRESSÃO – BITMAPS DUMMY (sem usar R.drawable)
    // ---------------------------------------------------------------------

    private Bitmap createDummyLogoBitmap() {
        Bitmap bmp = Bitmap.createBitmap(300, 80, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);
        canvas.drawColor(Color.WHITE);

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(Color.BLACK);
        paint.setTextSize(32f);
        paint.setTypeface(Typeface.DEFAULT_BOLD);

        canvas.drawText("VersaTI", 20, 50, paint);

        return bmp;
    }

    private Bitmap createDummyQrBitmap() {
        Bitmap bmp = Bitmap.createBitmap(200, 200, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);
        canvas.drawColor(Color.WHITE);

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(Color.BLACK);

        // desenha um quadrado simples como "QR de teste"
        canvas.drawRect(20, 20, 180, 180, paint);

        return bmp;
    }

    @ReactMethod
    public void impressaoLivre(final Promise promise) {
        new Thread(() -> {
            try {
                final PrinterIntegracao printer = getGerenciador().getPrinterIntegracao();
                Bitmap logo = createDummyLogoBitmap();

                printer.addBitmap(logo, PrinterTextAlignment.LEFT);
                printer.addBitmap(logo, PrinterTextAlignment.CENTER);
                printer.addBitmap(logo, PrinterTextAlignment.RIGHT);

                printer.addStringLine("EXTRA_SMALL_NORMAL_12345678901234567890123456789",
                        PrinterTextSize.EXTRA_SMALL, PrinterTextStyle.NORMAL,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("EXTRA_SMALL_BOLD_1234567890123456789012345678901",
                        PrinterTextSize.EXTRA_SMALL, PrinterTextStyle.BOLD,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("SMALL_NORMAL_12345678901234567890123456789",
                        PrinterTextSize.SMALL, PrinterTextStyle.NORMAL,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("SMALL_BOLD_1234567890123456789012345678901",
                        PrinterTextSize.SMALL, PrinterTextStyle.BOLD,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("MEDIUM_NORMAL_123456789012345678901234",
                        PrinterTextSize.MEDIUM, PrinterTextStyle.NORMAL,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("MEDIUM_BOLD_12345678901234567890123456",
                        PrinterTextSize.MEDIUM, PrinterTextStyle.BOLD,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("LARGE_NORMAL_1234567890123456789",
                        PrinterTextSize.LARGE, PrinterTextStyle.NORMAL,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("LARGE_BOLD_123456789012345678901",
                        PrinterTextSize.LARGE, PrinterTextStyle.BOLD,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("EXTRALARGE_NORMAL_12",
                        PrinterTextSize.EXTRA_LARGE, PrinterTextStyle.NORMAL,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("EXTRALARGE_BOLD_1234",
                        PrinterTextSize.EXTRA_LARGE, PrinterTextStyle.BOLD,
                        PrinterTextAlignment.CENTER, false);

                printer.addStringLine("MEDIUM_INVERTED",
                        PrinterTextSize.MEDIUM, PrinterTextStyle.NORMAL,
                        PrinterTextAlignment.CENTER, true);

                Typeface customTypeface = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD);
                printer.addStringLine("FONTE PERSONALIZADA",
                        customTypeface, 32, PrinterTextAlignment.CENTER, false);

                printer.print(new PrinterListener() {
                    @Override
                    public void eventoSaida(PrinterStatus printerStatus) {
                        if (printerStatus == PrinterStatus.ERROR_NO_PAPER) {
                            promise.reject("SAFRA_IMPRESSAO",
                                    "Sem papel na impressora. Chamar retentarImpressaoAposErro.");
                        } else if (printerStatus == PrinterStatus.OK) {
                            promise.resolve("OK");
                        } else {
                            promise.reject("SAFRA_IMPRESSAO", "Problema na impressão: " + printerStatus);
                        }
                    }

                    @Override
                    public void eventoException(Exception e) {
                        Log.e(TAG, "problema impressao livre", e);
                        promise.reject("SAFRA_IMPRESSAO_EXCEPTION", e);
                    }
                }, 150);

            } catch (Exception e) {
                promise.reject("SAFRA_IMPRESSAO_EXCEPTION", e);
            }
        }).start();
    }

        /**
     * Impressão de cupom personalizada a partir de um JSON vindo do JS.
     * O formato esperado é um array de objetos:
     * [
     *   { "type": "text", "content": "linha", "align": "left|center|right", "size": "small|medium|large|extra_small|extra_large", "style": "normal|bold|invert" },
     *   { "type": "blank" }
     * ]
     */
    @ReactMethod
    public void imprimirCupom(String jsonLines, final Promise promise) {
        new Thread(() -> {
            try {
                PrinterIntegracao printer = getGerenciador().getPrinterIntegracao();

                JSONArray arr = new JSONArray(jsonLines);

                for (int i = 0; i < arr.length(); i++) {
                    JSONObject obj = arr.getJSONObject(i);

                    String type = obj.optString("type", "text").toLowerCase();

                    // Linha em branco
                    if ("blank".equals(type)) {
                        printer.addStringLine(
                                "",
                                PrinterTextSize.SMALL,
                                PrinterTextStyle.NORMAL,
                                PrinterTextAlignment.LEFT,
                                false
                        );
                        continue;
                    }

                    // Linha de texto
                    String content = obj.optString("content", "");
                    String alignStr = obj.optString("align", "left").toLowerCase();
                    String sizeStr = obj.optString("size", "medium").toLowerCase();
                    String styleStr = obj.optString("style", "normal").toLowerCase();

                    PrinterTextAlignment align;
                    switch (alignStr) {
                        case "center":
                            align = PrinterTextAlignment.CENTER;
                            break;
                        case "right":
                            align = PrinterTextAlignment.RIGHT;
                            break;
                        case "left":
                        default:
                            align = PrinterTextAlignment.LEFT;
                            break;
                    }

                    PrinterTextSize size;
                    switch (sizeStr) {
                        case "extra_small":
                            size = PrinterTextSize.EXTRA_SMALL;
                            break;
                        case "small":
                            size = PrinterTextSize.SMALL;
                            break;
                        case "large":
                            size = PrinterTextSize.LARGE;
                            break;
                        case "extra_large":
                            size = PrinterTextSize.EXTRA_LARGE;
                            break;
                        case "medium":
                        default:
                            size = PrinterTextSize.MEDIUM;
                            break;
                    }

                    PrinterTextStyle textStyle = PrinterTextStyle.NORMAL;
                    boolean invert = false;
                    if ("bold".equals(styleStr)) {
                        textStyle = PrinterTextStyle.BOLD;
                    } else if ("invert".equals(styleStr)) {
                        textStyle = PrinterTextStyle.NORMAL;
                        invert = true;
                    }

                    printer.addStringLine(
                            content,
                            size,
                            textStyle,
                            align,
                            invert
                    );
                }

                printer.print(new PrinterListener() {
                    @Override
                    public void eventoSaida(PrinterStatus printerStatus) {
                        if (printerStatus == PrinterStatus.OK) {
                            promise.resolve("OK");
                        } else if (printerStatus == PrinterStatus.ERROR_NO_PAPER) {
                            promise.reject("SAFRA_IMPRESSAO",
                                    "Sem papel na impressora. Chame retentarImpressaoAposErro.");
                        } else {
                            promise.reject("SAFRA_IMPRESSAO",
                                    "Problema na impressão: " + printerStatus);
                        }
                    }

                    @Override
                    public void eventoException(Exception e) {
                        Log.e(TAG, "imprimirCupom exception", e);
                        promise.reject("SAFRA_IMPRESSAO_EXCEPTION", e);
                    }
                }, 150);

            } catch (JSONException e) {
                promise.reject("SAFRA_IMPRESSAO_JSON", e);
            } catch (Exception e) {
                promise.reject("SAFRA_IMPRESSAO_EXCEPTION", e);
            }
        }).start();
    }


    @ReactMethod
    public void testeStressImpressao(int max, final Promise promise) {
        // valor efetivamente final para ser usado dentro da lambda
        final int maxAttempts = (max <= 0) ? 1 : max;

        final AtomicInteger tentativa = new AtomicInteger(1);
        final AtomicInteger contadorSucesso = new AtomicInteger(0);

        new Thread(() -> {
            try {
                Bitmap qrcodeTeste = createDummyQrBitmap();
                Bitmap logo = createDummyLogoBitmap();

                for (; tentativa.get() <= maxAttempts; tentativa.incrementAndGet()) {
                    final PrinterIntegracao printer = getGerenciador().getPrinterIntegracao();

                    printer.addBitmap(logo, PrinterTextAlignment.LEFT);
                    printer.addBitmap(logo, PrinterTextAlignment.CENTER);
                    printer.addBitmap(logo, PrinterTextAlignment.RIGHT);

                    printer.addStringLine("STRESS TEST " + tentativa.get(),
                            PrinterTextSize.SMALL, PrinterTextStyle.BOLD,
                            PrinterTextAlignment.CENTER, false);

                    printer.addBitmap(qrcodeTeste, PrinterTextAlignment.CENTER);

                    final int currentTry = tentativa.get();

                    printer.print(new PrinterListener() {
                        @Override
                        public void eventoSaida(PrinterStatus printerStatus) {
                            if (printerStatus == PrinterStatus.OK) {
                                contadorSucesso.incrementAndGet();
                            }
                        }

                        @Override
                        public void eventoException(Exception e) {
                            Log.e(TAG, "testeStressImpressao exception tentativa " + currentTry, e);
                        }
                    }, 150);
                }

                WritableMap map = Arguments.createMap();
                map.putInt("tentativas", maxAttempts);
                map.putInt("sucessos", contadorSucesso.get());
                map.putInt("erros", maxAttempts - contadorSucesso.get());
                promise.resolve(map);

            } catch (Exception e) {
                promise.reject("SAFRA_STRESS_EXCEPTION", e);
            }
        }).start();
    }


    @ReactMethod
    public void retentarImpressaoAposErro(final Promise promise) {
        try {
            final PrinterIntegracao printer = getGerenciador().getPrinterIntegracao();
            printer.print(new PrinterListener() {
                @Override
                public void eventoSaida(PrinterStatus printerStatus) {
                    if (printerStatus == PrinterStatus.OK) {
                        promise.resolve("OK");
                    } else {
                        promise.reject("SAFRA_REPRINT", "Status: " + printerStatus);
                    }
                }

                @Override
                public void eventoException(Exception e) {
                    promise.reject("SAFRA_REPRINT_EXCEPTION", e);
                }
            }, 150);
        } catch (Exception e) {
            promise.reject("SAFRA_REPRINT_EXCEPTION", e);
        }
    }

    @ReactMethod
    public void limparBufferImpressao(final Promise promise) {
        try {
            getGerenciador().getPrinterIntegracao().clearBuffer(new PrinterListener() {
                @Override
                public void eventoSaida(PrinterStatus printerStatus) {
                    if (printerStatus == PrinterStatus.OK) {
                        promise.resolve("OK");
                    } else {
                        promise.reject("SAFRA_CLEAR_BUFFER", "Status: " + printerStatus);
                    }
                }

                @Override
                public void eventoException(Exception e) {
                    promise.reject("SAFRA_CLEAR_BUFFER_EXCEPTION", e);
                }
            });
        } catch (Exception e) {
            promise.reject("SAFRA_CLEAR_BUFFER_EXCEPTION", e);
        }
    }

    // ---------------------------------------------------------------------
    // NFC MIFARE
    // ---------------------------------------------------------------------

    @ReactMethod
    public void lerNFC(final Promise promise) {
        List<MifareBlockData> listBlocks = new ArrayList<>();
        for (int i = 0; i < 16; i++) {
            listBlocks.add(
                    new MifareBlockData(
                            i,
                            Utils.hexStringToByteArray("FFFFFFFFFFFF"),
                            null
                    )
            );
        }

        NFCRequest nfcRequest = new NFCRequest(
                "Por favor aproxime o cartão no terminal",
                listBlocks
        );

        getGerenciador().readMifareNFCBlocks(nfcRequest, new MifareNFCCallback() {
            @Override
            public void onSuccess(List<MifareBlockData> list) {
                WritableArray arr = Arguments.createArray();
                for (MifareBlockData block : list) {
                    WritableMap m = Arguments.createMap();
                    m.putInt("blockNumber", block.getBlockNumber());
                    m.putString("data", Utils.bytesToHex(block.getData()));
                    arr.pushMap(m);

                    Log.d(TAG, String.format("NFC block : %02d - Data: %s",
                            block.getBlockNumber(),
                            Utils.bytesToHex(block.getData())));
                }
                promise.resolve(arr);
            }

            @Override
            public void onError(int i) {
                promise.reject("SAFRA_NFC_READ_ERROR",
                        "Erro ao ler o cartão. Código: " + i);
            }
        });
    }

    @ReactMethod
    public void escreverNFC(String hexPayload, final Promise promise) {
        if (hexPayload == null || hexPayload.isEmpty()) {
            hexPayload = "000000000000000CAFE0000000000000";
        }

        List<MifareBlockData> listBlocks = new ArrayList<>();
        listBlocks.add(
                new MifareBlockData(
                        1,
                        Utils.hexStringToByteArray("FFFFFFFFFFFF"),
                        Utils.hexStringToByteArray(hexPayload)
                )
        );

        NFCRequest nfcRequest = new NFCRequest(
                "Por favor aproxime o cartão no terminal",
                listBlocks
        );

        getGerenciador().writeMifareNFCBlocks(nfcRequest, new MifareNFCCallback() {
            @Override
            public void onSuccess(List<MifareBlockData> list) {
                promise.resolve("OK");
            }

            @Override
            public void onError(int i) {
                promise.reject("SAFRA_NFC_WRITE_ERROR",
                        "Erro ao escrever no cartão. Código: " + i);
            }
        });
    }
}
