# Tetris Block Generator Code

The code generates the tetris blocks. We hereby defined the blocks in a binary grid, looking like this:


// Image to come


This results in a binary conversion which looks like this:


|binary  |integer|Tetris block|
|--------|-------|------------|
|00010111|23     |Reverse L   |
|00011110|30     |Reverse Z   |
|00101011|43     |L           |
|01010101|85     |Long One    |
|01110100|116    |T           |
|10110100|180    |Z           |
|11110000|240    |Square      |


Then we can adjust the cubits position depending on the overall value of the classic register, looking like this:

```python

# Example code for one register digit

# If register is 00000110 = 6, then rotate cubit by π 
qc.rx(np.pi, 0).c_if(cr, 6)

# If register is 00000100 = 4, then don't rotate cubit 
# (could have been left out, but for consistency purposes we left it in the code) 
qc.rx(0, 0).c_if(cr, 4)

# If register is 00000000 = 0
qc.rx(0, 0).c_if(cr, 0)

# Other register combinations should not appear to generate our 7 TETRIS blocks

# Measure and store at the new 4th position 
qc.measure(0,3)

# Reset to use the cubit for the next calculation
qc.reset(0)

```