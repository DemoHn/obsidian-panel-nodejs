class SevenDigit{
    constructor(canvas, center_x, center_y, config){

        config = config || {};
        this.canvas = canvas;
        this.center_x = center_x;
        this.center_y = center_y;

        this.context = this.canvas.getContext('2d');

        this.config = {
            HW_ratio : config.HW_ratio || 1.6,
            // about stroke
            stroke_width: config.stroke_width || 1.5,
            stroke_gap: config.stroke_gap || 0.6,

            // digit
            digit_width: config.digit_width || 16.0,
            digit_gap: config.digit_gap || 5.0,

            // color
            color: config.color || "black",
            background_color: config.background_color || "#eee",
        }
    }

    draw_digits(str){
        const _len_str = str.length;
        let _last_center_x;
        let _left_offset = this.center_x - (this.config.digit_width + this.config.digit_gap ) * (_len_str - 1) / 2;

        if(str[0] === "1"){
            _left_offset = _left_offset - this.config.digit_width / 2 + this.config.stroke_width*1.2; // offset when start with '1'
        }
        
        for(let i=0;i<_len_str;i++){
            _last_center_x = _left_offset + (this.config.digit_width + this.config.digit_gap)*i;
            this._draw_digit(_last_center_x, this.center_y, str[i]);
        }

        let _digital_height = this.config.digit_width * this.config.HW_ratio;
        return [_last_center_x + this.config.digit_width / 2, _digital_height];
    }

    // draw only one digit
    _draw_digit(center_x, center_y, digit){
        const FG       = this.config.color,
              BG       = this.config.background_color,
              width    = this.config.digit_width,
              height   = this.config.digit_width * this.config.HW_ratio,
              half_stroke = this.config.stroke_width / 2;
        
        let _digit;
        
        try {
            if(digit == "-"){
                _digit = 10;
            }else{
                _digit = parseInt(digit);
            }
        } catch (error) {
            return ;
        }
         /*
          
         __a__
       d|     |f
        |     |
        +--b--+
       e|     |g
        |__c__|

        */
        const digit_arr = [
            [FG,BG,FG,FG,FG,FG,FG], // 0
            [BG,BG,BG,BG,BG,FG,FG], // 1
            [FG,FG,FG,BG,FG,FG,BG], // 2
            [FG,FG,FG,BG,BG,FG,FG], // 3
            [BG,FG,BG,FG,BG,FG,FG], // 4
            [FG,FG,FG,FG,BG,BG,FG], // 5
            [FG,FG,FG,FG,FG,BG,FG], // 6
            [FG,BG,BG,BG,BG,FG,FG], // 7
            [FG,FG,FG,FG,FG,FG,FG], // 8
            [FG,FG,FG,FG,BG,FG,FG], // 9
            [BG,FG,BG,BG,BG,BG,BG], // "-"
        ];
       
        this._draw_horizontal_digit(center_x - width / 2 + half_stroke, center_y - height / 2, digit_arr[_digit][0]); // draw line 'a'        
        this._draw_horizontal_digit(center_x - width / 2 + half_stroke, center_y - half_stroke, digit_arr[_digit][1]); // draw line 'b'
        this._draw_horizontal_digit(center_x - width / 2 + half_stroke, center_y + height / 2 - half_stroke * 2, digit_arr[_digit][2]); // draw line 'c'

        this._draw_vertical_digit(center_x - width / 2, center_y - height / 2 + half_stroke, digit_arr[_digit][3]); // 'd'
        this._draw_vertical_digit(center_x - width / 2, center_y, digit_arr[_digit][4]); // 'e'

        this._draw_vertical_digit(center_x + width / 2 - half_stroke * 2, center_y - height / 2 + half_stroke, digit_arr[_digit][5]); // 'f'
        this._draw_vertical_digit(center_x + width / 2 - half_stroke * 2, center_y, digit_arr[_digit][6]); // 'g'
    }

    _draw_vertical_digit(start_x, start_y, color){
        /* 
          /\ <- a
         /  \
       b|   |f
        |   |
        |   |
        |   |
        |   |
      c \   / e
          \/
            <----- d
        */
        const stroke_width = this.config.stroke_width,
              stroke_gap   = this.config.stroke_gap,
              context      = this.context;

        const height = this.config.digit_width * this.config.HW_ratio;

        const half_stroke = stroke_width / 2;
        const len = (height - stroke_width) / 2;

        // set color
        context.fillStyle = color;

        context.beginPath();
        context.moveTo(start_x + half_stroke, start_y + stroke_gap); // -> a
        context.lineTo(start_x, start_y + stroke_gap + stroke_width / 2); // -> b
        context.lineTo(start_x, start_y + len - stroke_gap * 2 - stroke_width / 2); // -> c
        context.lineTo(start_x + half_stroke, start_y + len - stroke_gap * 2); // -> d
        context.lineTo(start_x + stroke_width, start_y + len - stroke_gap * 2 - stroke_width / 2); // -> e
        context.lineTo(start_x + stroke_width, start_y + stroke_gap + stroke_width / 2); // -> f
        context.fill();
    }

    _draw_horizontal_digit(start_x, start_y, color){
        /*
         a                       f    
         /-----------------------\ 
      b /                         \  e
        \                         /
      c  \-----------------------/  d
        */
        const stroke_width = this.config.stroke_width,
              stroke_gap   = this.config.stroke_gap,
              context      = this.context;

        const width = this.config.digit_width;

        const half_stroke = stroke_width / 2;

        const len = width - stroke_width;

        // set color
        context.fillStyle = color;

        context.beginPath();
        context.moveTo(start_x + half_stroke + stroke_gap, start_y); // -> a
        context.lineTo(start_x + stroke_gap, start_y + half_stroke); // -> b
        context.lineTo(start_x + half_stroke + stroke_gap, start_y + stroke_width); // -> c
        context.lineTo(start_x + len - stroke_gap*2 - half_stroke, start_y + stroke_width); // -> d
        context.lineTo(start_x + len - stroke_gap*2, start_y + stroke_width / 2); // -> e
        context.lineTo(start_x + len - stroke_gap*2 - half_stroke, start_y); // -> f
        context.fill();
    }
}

export default SevenDigit;