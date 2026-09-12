# Control Conceptual de Señales No Autorizadas en Centros Penitenciarios

Simulador web interactivo (SPA) que valida matemáticamente la atenuación pasiva de señales
celulares dentro de una infraestructura penitenciaria. Sustituye el paradigma de *jamming*
(interferencia activa, ilegal por el *spillover* que degrada el espectro concesionado) por un
enfoque de **atenuación pasiva y monitoreo inteligente**, confinando la señal dentro del perímetro
mediante las leyes de la física.

## Cómo ejecutar

El código usa módulos ES6 (`<script type="module">`), por lo que debe servirse por HTTP (no abrir
directamente con `file://`). Con Laragon basta colocar la carpeta en `www` y abrir:

```
http://localhost/U/Telecomunicaciones/Proyecto-final/
```

Alternativamente, desde la carpeta del proyecto:

```
python -m http.server 8080
```

Usando la extension de vsCode Live Server
## Qué hace

- **Plano 2D interactivo** de una celda y su muro perimetral, con gradiente de potencia de la señal.
  Al pasar el mouse se calcula la potencia estimada en ese punto (distancia + muros atravesados).
- **Parámetros**: selector de tecnología (2G → 5G mmWave), selector de material de muros
  (Concreto Reforzado, Ladrillo, Malla de Acero / Jaula de Faraday) y sliders de **grosor de muros**
  y **distancia torre-celda**.
- **Telemetría**: FSPL (Free Space Path Loss), atenuación por muros, pérdida total, potencia
  recibida y un medidor contra el umbral de comunicación de **−95 dBm**.
- **Relación frecuencia / longitud de onda (λ)**: gráfico de barras comparativo y onda animada que
  evidencia la relación inversa entre frecuencia y λ.

## Modelo matemático

- FSPL: `FSPL(dB) = 20·log10(d) + 20·log10(f) + 20·log10(4π/c)`
- Longitud de onda: `λ = c / f`
- Atenuación de muro: `A(dB) = α·(f_ghz)^n · grosor` (α y n por material)
- Potencia recibida: `Rx = Tx − FSPL − Σ(A_muros)`

## Estructura 

```
js/
  config/constants.js          Datos de configuración (tecnologías, materiales, sistema)
  core/EventEmitter.js         Patrón observador (S: una sola responsabilidad)
  domain/LinkBudgetCalculator.js  Cálculo puro del presupuesto de enlace (SRP, DIP)
  services/SimulationService.js   Estado + orquestación, inyecta el calculador (DIP, OCP)
  ui/
    ControlsView.js            Entrada del usuario (sliders/selectores)
    TelemetryView.js           Presenta métricas y medidor de umbral
    PlanRenderer.js            Render del plano 2D en canvas + interacción
    SpectrumView.js            Visualización frecuencia/λ
  App.js                       Composición de raíz (inyección de dependencias)
  main.js                      Punto de entrada
```
