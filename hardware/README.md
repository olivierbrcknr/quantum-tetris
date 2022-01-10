# Building the hardware

## Components

### Hardware

* [LED Matrix](https://www.adafruit.com/product/3826) **[1]**
* [Adafruit RGB Matrix Bonnet](https://www.adafruit.com/product/3211)
* Raspberry Pi
* [Power Supply](https://www.adafruit.com/product/658): 5V 10A **[2]**
* [NES USB Controller](https://www.amazon.com/Controller-suily-Joystick-RetroPie-Emulators/dp/B07M7SYX11)

1. You can find Adafruit's guide for the LED Matrix [here](https://learn.adafruit.com/32x16-32x32-rgb-led-matrix).
2. Adafruit suggests less current for regular usage, but in our Tetris case especially, we will have a lot of white LEDs, thus increasing the necessary current.


### Software

→ Raspberry Pi Method is run by using [Python](https://github.com/hzeller/rpi-rgb-led-matrix)


### Case

* 6mm M3 Screws × 10
* 8mm M3 Screws × 2
* 6mm M2.5 Screws × 4
* 6mm M2.5 Standoff × 4
* M2.5 Nuts × 4
* Zip Ties × 2
* Acrylic Glass to laser: minimum 148×275mm

## Assembly

Laser [→ this file]() out of the acrylic glass.

Place the elements like this:

// Image of assembly schematics

Be aware to assemble them in this order, otherwise you might not be able to attach all the components:
1. Zip ties
2. Raspberry Pi
3. LED Matrix

We shortened the cables of the power supply, so it fits better onto the wall.

// image of shortened cable

Once all the screws are in place, you should be able to fix the cables with the zip ties.

### Prepare the Raspberry Pi

Install [Raspberry Pi OS Lite](https://www.raspberrypi.com/software/) onto your SD card.

Install everything else as [Adafruit recommends](https://learn.adafruit.com/adafruit-rgb-matrix-bonnet-for-raspberry-pi/driving-matrices#step-6-log-into-your-pi-to-install-and-run-software-1745233-16).
We selected `bonnet`—as we use the bonnet—and `convenience`, which does not require soldering and leaves us the option to add sound to the game later. The installation can take up to 15 minutes.

```
curl https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/rgb-matrix.sh >rgb-matrix.sh
sudo bash rgb-matrix.sh
```

After the installation you will be asked to reboot. Do that.
You should be able to test it with that code. Refer to the [Adafruit tutorial](https://learn.adafruit.com/adafruit-rgb-matrix-bonnet-for-raspberry-pi/driving-matrices#testing-the-examples-2982010-30) if something does not work.

```sh
cd rpi-rgb-led-matrix/examples-api-use
sudo ./demo -D0 --led-rows=32 --led-cols=64 --led-slowdown-gpio=2 --led-gpio-mapping=adafruit-hat
```

Enable auto login
```sh
sudo raspi-config
```

Then select the following:

Choose option: 1 System Options
Choose option: S5 Boot / Auto Login
Choose option: B2 Console Autologin
Select Finish, and reboot the Raspberry Pi.

## The Code

### Installation

Upload this folder (`hardware`) onto your Raspberry Pi.

```
curl https://raw.githubusercontent.com/olivierbrcknr/quantum-tetris/main/hardware/install_QuantumTetris.sh >install_QuantumTetris.sh
sudo install_QuantumTetris.sh
```

And edit the `.bashrc` and add these lines at the end. They allow the script to run at boot, so the display starts automatically.

```
echo Running at boot 
sudo python /home/pi/quantumTetris/quantumTetris.py
```

### Development

Run this code to kill the python script from boot up, if you want to develop further:

```sh
kill $(pgrep -f 'sudo python /home/pi/quantumTetris/quantumTetris.py')
```

### Controller

https://core-electronics.com.au/tutorials/using-usb-and-bluetooth-controllers-with-python.html
