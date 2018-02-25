// import HoverInteraction from '../interactions/hover';

// export const hover = {
//   methods: {
//     registerHover () {
//       console.log('123===!!');
//       var hover = new HoverInteraction({
//         layerFilter: layer => {
//           if (Array.isArray(this.layer)) {
//             this.layer.forEach(val => {
//               if (val === layer) {
//                 return true;
//               }
//             });
//           } else {
//             console.log(this.layer, this.layer.get('id'), layer.get('id'));
//             return this.layer.get('id') === layer.get('id');
//           }
//         }
//       });
//       this.map.addInteraction(hover);
//       hover.on('enter', e => {
//         this.$emit('enter', e);
//       });
//       hover.on('leave', e => {
//         this.$emit('leave', e);
//       });
//       hover.on('hover', e => {
//         this.$emit('hover', e);
//       });
//     }
//   }
// };
