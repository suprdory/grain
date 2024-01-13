#%%
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display, clear_output
#%%
def add_grain(sandbox,c,x):
    column=sandbox[:,x]
    empty=np.where(column==0)[0]
    if len(empty)>0:
        sandbox[empty[0],x]=c

def random_tumble(sandbox,d,h):
    xxs=np.where(np.abs(d)>1)[0]
    #choose random unstable column
    cx=np.random.choice(xxs)
    # print(cx,d[cx])
    if d[cx]<0:
        # high column is cx, shift grain to right
        # print(h[cx],sandbox[h[cx]-1,cx])
        c=sandbox[h[cx]-1,cx]
        sandbox[h[cx]-1,cx]=0
        sandbox[h[cx+1],cx+1]=c
    else:
        # high column is cx+1, shift grain to left
        # print(h[cx+1],sandbox[h[cx+1]-1,cx+1])
        c=sandbox[h[cx+1]-1,cx+1]
        sandbox[h[cx+1]-1,cx+1]=0
        sandbox[h[cx],cx]=c


def settle(sandbox):
    h=ny-np.argmax(np.flipud(sandbox!=0),axis=0,)
    d=np.diff(h)
    # print(h)
    while np.max(np.abs(d)>1):
        random_tumble(sandbox,d,h)
        h=ny-np.argmax(np.flipud(sandbox!=0),axis=0,)
        d=np.diff(h)
  
# xs=np.random.randint(0,nx,50)
# for x in xs:
#     add_grain(sandbox,1,x)

ny,nx=50,100
sandbox=np.zeros((ny,nx))
sandbox[0,:]=1

fig,ax=plt.subplots(1,1)
im=ax.imshow(sandbox,origin="lower",vmin=0,vmax=10)

for x in range(1000):
    c=6+4*np.sin(x/10)
    # add_grain(sandbox,np.random.randint(2,10),int(nx/2))
    add_grain(sandbox,c,int(nx/2))

    h=ny-np.argmax(np.flipud(sandbox!=0),axis=0,)
    d=np.diff(h)
    while np.max(np.abs(d)>1):
        random_tumble(sandbox,d,h)
        h=ny-np.argmax(np.flipud(sandbox!=0),axis=0,)
        d=np.diff(h)
    # im.set_data(sandbox)
    # display(fig)  
    # clear_output(wait = True)
    # plt.pause(0.001)

im=ax.imshow(sandbox,origin="lower",vmin=0,vmax=10)

# plt.imshow(sandbox,origin="lower")


#%%

# x=np.random.rand(100,100)
# fig,ax=plt.subplots(1,1)
# im=ax.imshow(x)
# for i in range (10):
#     x=np.random.rand(100,100)
#     im.set_data(x)
#     display(fig)  
#     clear_output(wait = True)
#     plt.pause(0.05)

