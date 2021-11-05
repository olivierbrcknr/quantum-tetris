# Building the hardware

## Components

### Hardware

* [LED Matrix](https://www.adafruit.com/product/3826) **[1]**
* [Adafruit RGB Matrix Shield](https://www.adafruit.com/product/2601)
* Arduino Uno **The Matrix only supports specific boards! **
* [Power Supply](https://www.adafruit.com/product/1466): 5V 4A **[2]**
* [Power Supply](https://www.adafruit.com/product/658): 5V 10A **[2]**
* [DC Power Jack Adapter](https://www.adafruit.com/product/368)

1. You can find Adafruit's guide for the LED Matrix [here](https://learn.adafruit.com/32x16-32x32-rgb-led-matrix).\
2. Adafruit suggests less current for regular usage, but in our Tetris case especially, we will have a lot of white LEDs, thus increasing the necessary current.

#### Raspberry Pi Variant
The use of a Raspberry Pi Would allow the use of a USB game controller.

* [Matrix Bonnet](https://www.adafruit.com/product/3211)
* [Matrix HAT](https://www.adafruit.com/product/2345)

→ Raspberry Pi Method is run by using [Python](https://github.com/hzeller/rpi-rgb-led-matrix)


### Software

* [Adafruit RGB Matrix Panel library](https://github.com/adafruit/RGB-matrix-Panel)
* [Adafruit GFX Library](https://github.com/adafruit/Adafruit-GFX-Library)
* [Adafruit Bus IO Library](https://github.com/adafruit/Adafruit_BusIO)

### Case

* M3 Screws × 20
* M3 Nuts × 10
* Acrylic Glass to laser: minimum 148×275mm
* Aluminium "U" Profiles
* [NES USB Controller](https://www.amazon.com/Controller-suily-Joystick-RetroPie-Emulators/dp/B07M7SYX11)

## The Code


## Assembly

Laser [→ this file]() out of the acrylic glass.


The free pins for the controller.

|Pin|Board|
|---|---|
|0|Up|
|1|Down|
|11|Left|
|12|Right|
|13|Start|


## Controller

https://www.instructables.com/How-to-access-5-buttons-through-1-Arduino-input/
