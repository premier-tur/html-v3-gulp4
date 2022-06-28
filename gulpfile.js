const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'));
const {src, dest, watch, parallel, series} = require('gulp');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = import('gulp-imagemin');
const del = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]
        ))
        .pipe(dest('dist/images'))
}

async function images_to_dist() {
    const imagemin = await import('gulp-imagemin');
    const imagePlugins = [
        imagemin.svgo({
            plugins: [{removeViewBox: false}]
        })
    ];

    return gulp.src('app/images/**/*')
        .pipe(imagemin.default(imagePlugins))
        .pipe(gulp.dest('dist/images'));
}

function scripts() {
    return src([
        // 'node_modules/moment/dist/moment.js',
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
        'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
        'node_modules/rateyo/src/jquery.rateyo.js',
        'node_modules/validator/validator.js',
        'node_modules/imask/dist/imask.js',
        'app/js/main.js'
        // 'node_modules/daterangepicker/daterangepicker.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


function styles() {
    return src('app/sass/style.sass')
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: "expanded" //'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function build1() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
        .pipe(dest('dist'))
}

function watching() {
    watch(['app/sass/**/*.sass'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

gulp.task('default', parallel(styles, scripts, browsersync, watching));
gulp.task('build', series(cleanDist, images_to_dist, build1));

// exports.build = series(cleanDist, images_to_dist, build);
// exports.default = parallel(styles, scripts, browsersync, watching);
