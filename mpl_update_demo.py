#%%
# importing libraries
import numpy as np
import time
import matplotlib.pyplot as plt
 
# creating initial data values
# of x and y
x = np.linspace(0, 10, 100)
y = np.sin(x)
 
# to run GUI event loop
plt.ion()
 
# here we are creating sub plots
figure, ax = plt.subplots(figsize=(10, 8))
line1, = ax.plot(x, y)
 
# setting title
plt.title("Geeks For Geeks", fontsize=20)
 
# setting x-axis label and y-axis label
plt.xlabel("X-axis")
plt.ylabel("Y-axis")
 
# Loop
for _ in range(50):
    # creating new Y values
    new_y = np.sin(x-0.5*_)
 
    # updating data values
    line1.set_xdata(x)
    line1.set_ydata(new_y)
 
    # drawing updated values
    figure.canvas.draw()
 
    # This will run the GUI event
    # loop until all UI events
    # currently waiting have been processed
    figure.canvas.flush_events()
 
    time.sleep(0.1)

#%%    

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import time
from IPython import display
# %matplotlib inline

i = pd.date_range('2013-1-1',periods=100,freq='s')

while True:
    # try:
    plt.plot(pd.Series(data=np.random.randn(100), index=i))
    display.display(plt.gcf())
    display.clear_output(wait=True)
    time.sleep(1)
    break


#%%
# %matplotlib ipympl
import time
import numpy as np
import matplotlib.pyplot as plt
x=np.random.rand(100,100)
im=plt.imshow(x)
for i in range (10):
    time.sleep(0.1)
    x=np.random.rand(100,100)
    im.set_data(x)
    plt.draw()
# 
#%%
# %matplotlib ipympl
import matplotlib.pyplot as plt
import numpy as np
import matplotlib.animation

f = plt.figure()
ax = f.gca()

im = np.random.randn(100,100)
image = plt.imshow(im, interpolation='None', animated=True)

def function_for_animation(frame_index):
    im = np.random.randn(100,100)
    image.set_data(im)
    ax.set_title(str(frame_index))
    return image,

ani = matplotlib.animation.FuncAnimation(f, function_for_animation, interval=200, frames=10, blit=True)
#%%
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import time

fig=plt.figure()
ax1=fig.add_subplot(1,1,1)

x=[]
y=[]

def frames():
    for i in range(20):
        yield i, i*2

def animate(args):
    ax1.imshow(np.random.rand(100,100))
    plt.autoscale(enable=True, axis='both')

ani = FuncAnimation(fig, animate, interval=100,save_count=10)
plt.show()

#%%
# Import Libraries

import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display, clear_output

# Create figure and subplot

fig = plt.figure()
ax = fig.add_subplot(1, 1, 1) 

# Define and update plot

for i in range(20):
    x = np.linspace(0, i, 100);
    y = np.cos(x) 
    ax.set_xlim(0, i)    
    ax.cla()
    ax.plot(x, y)
    display(fig)    
    clear_output(wait = True)
    plt.pause(0.1)


#%%
# import time
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display, clear_output
x=np.random.rand(100,100)
fig,ax=plt.subplots(1,1)
im=plt.imshow(x)
for i in range (20):
    x=np.random.rand(100,100)
    im.set_data(x)
    display(fig)  
    clear_output(wait = True)
    plt.pause(0.05)