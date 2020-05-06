/*
 * @Author: huangbaochen aka 3Gee <huangbaochenwo@live.come>
 * @Date: 2020-05-06 11:22:18
 * @LastEditTime: 2020-05-06 16:45:57
 * @LastEditors: huangbaochen aka 3Gee <huangbaochenwo@live.come>
 * @Description: 坐标变换
 * @如有问题，请联系维护人
 */
import { Point, Rectangle } from './base_class'
export interface TransferParam {
    theta?: number;
    x?: number;
    y?: number;
}

export enum TransferFuncEnum {
    transfer_angle = 'angle',
    transfer_trace = 'trace'
}

export type TransferFunc = (p: Point) => Point
export type TransferFuncMata = (param: TransferParam) => TransferFunc
export type TransferStep = [TransferFuncEnum, TransferParam]

export function transfer_angle(param: TransferParam): TransferFunc {
    if (typeof param.theta !== 'undefined') {
        const theta = param.theta
        return (p: Point) => new Point(
            p.x * Math.cos(theta) + p.y * Math.sin(theta),
            p.y * Math.cos(theta) - p.x * Math.sin(theta)
        )
    } else {
        return (p: Point) => p
    }
}

export function transfer_trace(param: TransferParam): TransferFunc {
    if (typeof param.x !== 'undefined' && typeof param.y !== 'undefined') {
        const x = param.x
        const y = param.y
        return (p: Point) => new Point(
            p.x + x,
            p.y + y
        )
    } else {
        return (p: Point) => p
    }
}

export function reverse_transfer_angle(param: TransferParam): TransferFunc {
    if (typeof param.theta !== 'undefined') {
        const theta = param.theta
        return transfer_angle({theta: Math.PI * 2 - theta})
    } else {
        return (p: Point) => p
    }
}

export function reverse_transfer_trace(param: TransferParam): TransferFunc {
    if (typeof param.x !== 'undefined' && typeof param.y !== 'undefined') {
        const x = param.x
        const y = param.y
        return transfer_trace({x: -x, y: -y})
    } else {
        return (p: Point) => p
    }
}

function reverse_transfer(f: TransferFuncEnum): TransferFuncMata {
    if (f == 'angle') {
        return reverse_transfer_angle
    } else {
        return reverse_transfer_trace
    }
}

const transfer_map = {
    'angle': transfer_angle,
    'trace': transfer_trace,
    'reverse_angle': reverse_transfer_angle,
    'reverse_trace': reverse_transfer_trace
}

/*
 * 通过定义转换步骤，返回一个前向的方法和后向的方法
 * 例：
 * tf = transfer_func_factory([['angle', {'theta': Math.PI}], 'trace', {'x': 1, 'y': 2}])
 * p1 = tf.step_forward(p) // 将P点逆时针旋转180度之后，向x左移1，向y上移2
 * p == tf.step_backward(p1) // 还原
 */
export function transfer_func_factory(step_list: Array<TransferStep>): object {
    return {
        // 前向转换
        step_forward: (
            step_list
                .map(
                    (t) => transfer_map[t[0]](t[1])
                )
                .reduce(
                    (t, s) => ((p: Point) => s(t(p)))
                )
        ),
        // 复原
        step_backward: (
            step_list
                .map(
                    (t) => reverse_transfer(t[0])(t[1])
                )
                .reduceRight(
                    (t, s) => ((p: Point) => s(t(p)))
                )
        )
    }
}