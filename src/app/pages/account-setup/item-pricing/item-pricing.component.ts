import { Component } from '@angular/core';

@Component({
  selector: 'app-item-pricing',
  templateUrl: './item-pricing.component.html',
  styleUrls: ['./item-pricing.component.scss']
})
export class ItemPricingComponent {

  openCanvas: boolean = false;
  editData : any = {}

  clothesList = [

  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },
  { 
     imgSrc : 'https://s3-alpha-sig.figma.com/img/85d3/f013/d784a79fb869d091cc23d18cfa477e96?Expires=1701648000&Signature=gJKR5nmILgcmfOSj15jlWq7r3zcMyKpSI1Ax7rEi1OeSNu3-eOXFsxvGT-yc8xMDjKsQz3sHKcEz1pdE-msBI7TLgvzghqknEPv~cYadlEuHFCBe1mRdVvWFX4-gPMZKlkNTvLUcffpxrSKAcsaVtIHTIPOX3tAt-GqwPbSWLYZ9uLyxyPwkaxyGqv00vdFkfxkhbj0m-BO5h1XPpFS5wrydfTK2pVu2uJp7Lkp-rmilrv3ismXDKJFkgOdxCgDpgHvr1WsTyA82xyDkuS4hYHGyZRCObXVcUbCWeQUZDN2LRu7ilZ4rD7q5CaRS2bYSfpHMs1Cka42cpvhTb6~yzQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
  
    'Type' : 'pant'
  },
  { 
     imgSrc : 'https://www.stuartslondon.com/images/matinique-trostol-chambray-blue-dress-shirt-d57080005-p18651-60784_medium.jpg',
  
    'Type' : 'shirt'
  },
  { 
     imgSrc : 'https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png',
  
    'Type' : 't-shirt'
  },

  ]

  openAsideBar(data : any){

    this.openCanvas = true

    this.editData = data

  }

}
